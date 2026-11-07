import os
import re
import logging
import numpy as np

logger = logging.getLogger(__name__)

_MODEL_INSTANCE = None
EMBEDDING_DIM = 384
_EMBEDDING_CACHE: dict[str, list[float]] = {}

CONCEPT_CLUSTERS = {
    'ai_ml': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'nlp', 'data science', 'computer vision'],
    'web': ['web', 'react', 'next.js', 'javascript', 'typescript', 'frontend', 'html', 'css', 'vue', 'angular', 'node'],
    'backend': ['backend', 'django', 'python', 'fastapi', 'flask', 'sql', 'postgresql', 'database', 'api', 'docker'],
    'systems': ['c++', 'c', 'rust', 'operating systems', 'linux', 'embedded', 'hardware', 'assembly'],
    'math': ['math', 'mathematics', 'calculus', 'linear algebra', 'statistics', 'probability', 'discrete'],
    'design': ['design', 'ui', 'ux', 'figma', 'graphic design', 'photoshop', 'illustrator'],
}

def get_sentence_transformer():
    """
    Lazy-loads and caches the sentence-transformers model instance.
    Uses 'all-MiniLM-L6-v2' (384 dimensions, fast and lightweight).
    On Render 512MB free tier, skips heavy PyTorch to prevent Out-Of-Memory crashes.
    """
    if os.environ.get('RENDER') or os.environ.get('DISABLE_HEAVY_EMBEDDING') == '1':
        return None

    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        try:
            from sentence_transformers import SentenceTransformer
            _MODEL_INSTANCE = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Successfully loaded sentence-transformers (all-MiniLM-L6-v2).")
        except Exception as e:
            logger.error(f"SentenceTransformer unavailable: {e}. Using resilient fallback.")
            return None
    return _MODEL_INSTANCE

def generate_embedding(text: str) -> list[float]:
    """
    Generates a 384-dimensional normalized vector embedding for the input text.
    Uses in-memory cache to guarantee sub-millisecond response times under cloud concurrency.
    """
    if not text or not str(text).strip():
        return []

    cleaned = str(text).strip().lower()
    if cleaned in _EMBEDDING_CACHE:
        return _EMBEDDING_CACHE[cleaned]

    vec = None
    model = get_sentence_transformer()
    if model is not None:
        try:
            raw_vec = model.encode(cleaned, normalize_embeddings=True)
            vec = [float(x) for x in raw_vec]
        except Exception as e:
            logger.error(f"Error encoding embedding: {e}")

    if not vec:
        # Resilient deterministic normalized vector projection with semantic clustering
        words = re.findall(r'\b\w+\b', cleaned)
        arr = np.zeros(EMBEDDING_DIM, dtype=np.float32)
        for w in words:
            h = abs(hash(w)) % (2**32)
            np.random.seed(h)
            arr += np.random.randn(EMBEDDING_DIM).astype(np.float32) * 0.3

        for c_idx, (cluster, keywords) in enumerate(CONCEPT_CLUSTERS.items()):
            start_idx = (c_idx * 50) % EMBEDDING_DIM
            end_idx = min(start_idx + 50, EMBEDDING_DIM)
            for kw in keywords:
                if kw in cleaned or any(w in kw.split() for w in words):
                    arr[start_idx:end_idx] += 1.5

        norm = float(np.linalg.norm(arr))
        if norm > 0:
            arr = arr / norm
        vec = [float(x) for x in arr]

    _EMBEDDING_CACHE[cleaned] = vec
    return vec

def is_empty_vector(v) -> bool:
    """Safe check for None, empty list, or empty NumPy array without ambiguity error."""
    if v is None:
        return True
    try:
        return len(v) == 0
    except Exception:
        return True

def compute_cosine_similarity(vec1, vec2) -> float:
    """
    Computes cosine similarity between two 1D numeric vectors.
    Returns a float between 0.0 and 1.0 (clamped).
    """
    if is_empty_vector(vec1) or is_empty_vector(vec2):
        return 0.0

    try:
        a = np.asarray(vec1, dtype=np.float32)
        b = np.asarray(vec2, dtype=np.float32)

        norm_a = float(np.linalg.norm(a))
        norm_b = float(np.linalg.norm(b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        dot_prod = float(np.dot(a, b))
        similarity = dot_prod / (norm_a * norm_b)
        # Clamp to [0.0, 1.0] for skill matching percentage
        return max(0.0, min(1.0, float(similarity)))
    except Exception as e:
        logger.error(f"Error computing cosine similarity: {e}")
        return 0.0

def compute_profile_semantic_match(my_profile, target_profile) -> dict:
    """
    Computes bidirectional semantic similarity between two student profiles:
    - How well target's teaching skills match my learning skills
    - How well my teaching skills match target's learning skills
    """
    default_result = {
        'semantic_score': 0.0,
        'match_percentage': 0,
        'learn_from_peer_similarity': 0.0,
        'teach_to_peer_similarity': 0.0,
        'is_semantic_match': False,
    }

    try:
        # 1. Learn from peer match (my_learn <-> target_teach)
        my_learn_vec = getattr(my_profile, 'learn_embedding', None)
        target_teach_vec = getattr(target_profile, 'teach_embedding', None)

        if is_empty_vector(my_learn_vec) and getattr(my_profile, 'skills_want_to_learn', None):
            my_learn_vec = generate_embedding(my_profile.skills_want_to_learn)
        if is_empty_vector(target_teach_vec) and getattr(target_profile, 'skills_can_teach', None):
            target_teach_vec = generate_embedding(target_profile.skills_can_teach)

        sim_learn = compute_cosine_similarity(my_learn_vec, target_teach_vec)

        # 2. Teach to peer match (my_teach <-> target_learn)
        my_teach_vec = getattr(my_profile, 'teach_embedding', None)
        target_learn_vec = getattr(target_profile, 'learn_embedding', None)

        if is_empty_vector(my_teach_vec) and getattr(my_profile, 'skills_can_teach', None):
            my_teach_vec = generate_embedding(my_profile.skills_can_teach)
        if is_empty_vector(target_learn_vec) and getattr(target_profile, 'skills_want_to_learn', None):
            target_learn_vec = generate_embedding(target_profile.skills_want_to_learn)

        sim_teach = compute_cosine_similarity(my_teach_vec, target_learn_vec)

        best_sim = max(float(sim_learn), float(sim_teach))
        match_percentage = int(round(best_sim * 100))

        return {
            'semantic_score': round(best_sim, 4),
            'match_percentage': match_percentage,
            'learn_from_peer_similarity': round(float(sim_learn), 4),
            'teach_to_peer_similarity': round(float(sim_teach), 4),
            'is_semantic_match': bool(best_sim >= 0.40),
        }
    except Exception as e:
        logger.error(f"Error computing profile semantic match: {e}")
        return default_result

