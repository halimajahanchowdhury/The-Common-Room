import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'common_room_backend.settings')
django.setup()

from django.contrib.auth.models import User
from profiles.models import Profile
from profiles.serializers import ProfileSerializer
from profiles.embeddings import generate_embedding, compute_cosine_similarity
from rest_framework.test import APIRequestFactory, force_authenticate

print("=== STARTING SEMANTIC & FUZZY MATCHING VERIFICATION ===")

# 1. Test embedding vector generation
v_ml = generate_embedding("Machine Learning & Data Science")
v_ai = generate_embedding("Artificial Intelligence & Deep Learning")
v_cook = generate_embedding("Italian Pasta Cooking")

sim_ml_ai = compute_cosine_similarity(v_ml, v_ai)
sim_ml_cook = compute_cosine_similarity(v_ml, v_cook)

print(f"1. Vector Dimension: {len(v_ml)} (Expected 384)")
assert len(v_ml) == 384, f"Expected 384, got {len(v_ml)}"

print(f"2. Cosine Similarity (ML & Data Science <-> AI & Deep Learning): {round(sim_ml_ai * 100, 1)}%")
print(f"3. Cosine Similarity (ML & Data Science <-> Italian Pasta Cooking): {round(sim_ml_cook * 100, 1)}%")

assert sim_ml_ai > 0.50, f"Expected > 50% semantic similarity, got {sim_ml_ai}"
assert sim_ml_cook < 0.25, f"Expected < 25% semantic similarity, got {sim_ml_cook}"

# 2. Test ProfileSerializer semantic matching output
user_learner, _ = User.objects.get_or_create(username="test_sem_learner", defaults={"email": "sem_l@test.com"})
p_learner, _ = Profile.objects.get_or_create(user=user_learner)
p_learner.skills_want_to_learn = "Machine Learning, Neural Networks"
p_learner.skills_can_teach = "React"
p_learner.save()

user_teacher, _ = User.objects.get_or_create(username="test_sem_teacher", defaults={"email": "sem_t@test.com"})
p_teacher, _ = Profile.objects.get_or_create(user=user_teacher)
p_teacher.skills_can_teach = "Artificial Intelligence, Deep Learning"
p_teacher.skills_want_to_learn = "Next.js"
p_teacher.save()

factory = APIRequestFactory()
request = factory.get('/api/profiles/')
request.user = user_learner

serializer = ProfileSerializer(p_teacher, context={'request': request})
data = serializer.data
matches = data.get('skill_matches', {})

print(f"4. Serializer Match Detected: {matches.get('has_match')} (Expected True)")
print(f"5. Semantic Score: {matches.get('semantic_score')} (~{matches.get('match_percentage')}%)")
print(f"6. Is Semantic Match Flag: {matches.get('is_semantic_match')}")

assert matches.get('has_match') is True, "Expected semantic match to be True!"
assert matches.get('is_semantic_match') is True, "Expected is_semantic_match to be True!"
assert matches.get('match_percentage') >= 50, f"Expected >= 50%, got {matches.get('match_percentage')}"

print("=== ALL SEMANTIC MATCHING TESTS PASSED SUCCESSFULLY! ===")
