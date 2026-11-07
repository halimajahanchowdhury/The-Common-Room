import sys
import traceback
from django.http import JsonResponse

def custom_500(request):
    exc_type, exc_value, exc_traceback = sys.exc_info()
    formatted = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback)) if exc_traceback else "No traceback"
    return JsonResponse({
        'error': str(exc_value) if exc_value else "Internal Server Error",
        'traceback': formatted
    }, status=500)
