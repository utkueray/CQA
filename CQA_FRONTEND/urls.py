from django.conf.urls import url
from django.urls import path
from . import views

urlpatterns = [
    url(r'^$', views.home, name="homepage"),
    url(r'^test/$', views.test, name="test"),
    url(r'^dashboard/$', views.dashboard, name="dashboard"),
    url(r'^askQuestions/$', views.askQuestions, name="askQuestions"),
    url(r'^answerQuestions/$', views.answerQuestions, name="answerQuestions"),
    path('results/<int:derived_userReputation>/<int:derived_userViews>/<int:derived_userUpVotes>/<int:derived_userDownVotes>/<int:derived_userCreationDate>/<int:derived_userLastAccessDate>/<derived_title>/<derived_question>/<derived_tags>/', views.results, name="results")
]