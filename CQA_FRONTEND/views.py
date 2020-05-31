from django.shortcuts import render
import pandas as pd
import gensim, json
from datetime import datetime
import requests
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from imblearn.over_sampling import ADASYN
from sklearn.ensemble import RandomForestClassifier

# user date pulled from stackexchange API
now = datetime.now()
derived_creation_date = datetime.now().isoformat()

# load doc2vec model once to make system work faster for every page
model = gensim.models.doc2vec.Doc2Vec.load("CQA_FRONTEND/static/data/doc2vecmodel")


# load test view
def test(request):
    # testing new features
    return render(request, 'test.html')


# load home view
def home(request):
    # index page
    return render(request, 'index.html')


# load dashboard view
def dashboard(request):
    # first page seen by the user after login
    return render(request, 'dashboard.html')


# load ask question view
def askQuestions(request):
    # all the functionality handled in the frontend
    return render(request, 'askQuestion.html')


# load answer question view
def answerQuestions(request):
    # get user data from cookies
    userData = (json.loads(request.COOKIES.get('userData')))
    # get response from Stack Exchange API for questions that user asked

    url = "https://api.stackexchange.com/2.2/users/" + str(
        userData["selectedSiteID"]) + "/answers?order=desc&sort=activity&site=" + str(
        userData["selectedSiteParam"]) + "&filter=!9Z(-wwYGT&key=" + str(userData["APIKEY"])

    response = requests.get(url)

    # print(url)

    # generate a dictionary to save suggestion questions based on all of the previous questions user asked
    suggestionTitle = ""
    suggestionQuestion = ""
    suggestionTags = []

    for item in response.json()["items"][:20]:
        # question data that will be used in the model

        suggestionTitle += item["title"]
        suggestionQuestion += item["body"]
        suggestionTags += item["tags"]

    suggectionDoc = suggestionTitle + suggestionQuestion + ' '.join(map(str, suggestionTags))

    # generate a corpus with the question data
    corpus = list(read_corpus([suggectionDoc], tokens_only=True))

    # infer question data and get similarity results
    inferred_vector = model.infer_vector(corpus[0])
    sims = model.docvecs.most_similar([inferred_vector], topn=5)

    resultDict = {}

    # save id and similarity score for each question to result dict
    for (key, val) in sims:
        resultDict[str(key)] = val

    suggestionDict = resultDict

    # generate a dictionary to save suggestion questions based on individual questions user asked

    questionDict = {}

    for item in response.json()["items"][:5]:

        # question data that will be used in the model
        title = item["title"]
        question = item["body"]
        tags = item["tags"]
        doc = title + question + ' '.join(map(str, tags))

        # generate a corpus with the question data
        corpus = list(read_corpus([doc], tokens_only=True))

        # infer question data and get similarity results
        inferred_vector = model.infer_vector(corpus[0])
        sims = model.docvecs.most_similar([inferred_vector], topn=5)

        resultDict = {}

        # save id and similarity score for each question to result dict
        for (key, val) in sims:
            resultDict[str(key)] = val

        questionDict[str(item["question_id"])] = str(resultDict)

    return render(request, 'answerQuestion.html',
                  context={'questionDict': questionDict, 'suggestionDict': suggestionDict})


# load tag search results view
def tagSearch(request, derived_tags):
    # generate corpus with user entered tags data
    corpus = list(read_corpus([derived_tags.replace("_", " ", len(derived_tags))], tokens_only=True))
    # infer vector with the corpus
    inferred_vector = model.infer_vector(corpus[0])
    sims = model.docvecs.most_similar([inferred_vector], topn=30)

    resultDict = {}

    for (key, val) in sims:
        resultDict[key] = val

    return render(request, 'tagsearch.html', context={'resultDict': resultDict})


# load results for askquestion view
def results(request, derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
            derived_userCreationDate, derived_userLastAccessDate, derived_title, derived_question, derived_tags):
    title = derived_title.replace("_", " ", len(derived_title))
    question = derived_question.replace("_", " ", len(derived_title))
    doc = title + question + derived_tags.replace("_", " ", len(derived_tags))

    tags = "<" + derived_tags.replace("_", "><", len(derived_tags)) + ">"
    derived_userCreationDateFormat = datetime.fromtimestamp(derived_userCreationDate).isoformat()
    derived_userLastAccessDateFormat = datetime.fromtimestamp(derived_userLastAccessDate).isoformat()

    corpus = list(read_corpus([doc], tokens_only=True))
    inferred_vector = model.infer_vector(corpus[0])
    sims = model.docvecs.most_similar([inferred_vector], topn=30)

    resultDict = {}

    for (key, val) in sims:
        resultDict[key] = val

    answerPercentage = \
        willAnswerPer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
                      derived_userCreationDateFormat, derived_userLastAccessDateFormat, title, question, tags)[1]

    time = timePer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
                   derived_userCreationDateFormat, derived_userLastAccessDateFormat, title, question, tags)

    return render(request, 'results.html', context={'resultDict': resultDict, 'answerPercentage': answerPercentage,
                                                    'time': time})


# returns document for corpus generation and if necessary tokenize
def read_corpus(fname, tokens_only=False):
    for i, line in enumerate(fname):
        tokens = gensim.utils.simple_preprocess(line)
        if tokens_only:
            yield tokens
        else:
            # For training data, add tags
            yield gensim.models.doc2vec.TaggedDocument(tokens, [i])


# returns part of the day depending on the input
def get_part_of_day(x):
    return (
        "1" if 5 <= int(x.strftime('%H')) <= 10
        else
        "2" if 11 <= int(x.strftime('%H')) <= 16
        else
        "3" if 17 <= int(x.strftime('%H')) <= 22
        else
        "4"
    )


# encoder
def encoder(x):
    a = 0.0
    b = 0.0
    c = 0.0

    if x == "1":
        return a, b, c
    elif x == "2":
        a = 1.0
        return a, b, c
    elif x == "3":
        b = 1.0
        return a, b, c
    else:
        c = 1.0
        return a, b, c


# returns the probability of user getting an answer to the asked question
# this function uses data saved in Task1_will_my_question_get_answered
# please read Task1_will_my_question_get_answered to understand how this function/process works
# takes shuffled_perc and newposts from Task1_will_my_question_get_answered
def willAnswerPer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
                  derived_userCreationDate, derived_userLastAccessDate, derived_title, derived_question, derived_tags):
    # load shuffled_final dataframe as pandas
    shuffled_final = pd.read_pickle("CQA_FRONTEND/static/data/shuffled_perc")
    # load newposts dataframe as pandas
    newposts = pd.read_pickle("CQA_FRONTEND/static/data/newposts")

    df = pd.DataFrame(
        {'Question': [derived_question], 'Title': [derived_title], 'Creation Date': [derived_creation_date],
         'Tags': [derived_tags], 'User Reputation': [derived_userReputation],
         "User Creation Date": [derived_userCreationDate], "User Last Access Date": [derived_userLastAccessDate],
         "User Views": [derived_userViews], "User UpVotes": [derived_userUpVotes],
         "User DownVotes": [derived_userDownVotes]})

    df['Creation Date'] = pd.to_datetime(df['Creation Date'])
    df['User Creation Date'] = pd.to_datetime(df['User Creation Date'])
    df['User Last Access Date'] = pd.to_datetime(df['User Last Access Date'])
    df['User DownVotes'] = df['User DownVotes'].astype(int)
    df['User UpVotes'] = df['User UpVotes'].astype(int)
    df['User Reputation'] = df['User Reputation'].astype(int)
    df['User Views'] = df['User Views'].astype(int)

    df = df.fillna(0)

    df["Creation Date"] = df["Creation Date"].apply(get_part_of_day)
    df["User Creation Date"] = df["User Creation Date"].apply(get_part_of_day)
    df["User Last Access Date"] = df["User Last Access Date"].apply(get_part_of_day)

    df["CreationDate_1"], df["CreationDate_2"], df["CreationDate_3"] = zip(*df['Creation Date'].map(encoder))
    df["UserCreationDate_1"], df["UserCreationDate_2"], df["UserCreationDate_3"] = zip(
        *df['User Creation Date'].map(encoder))
    df["UserLastAccessDate_1"], df["UserLastAccessDate_2"], df["UserLastAccessDate_3"] = zip(
        *df['User Last Access Date'].map(encoder))

    df['Tag Count'] = df['Tags'].str.count('<')
    df['Tags'] = df['Tags'].str.replace('<', '')
    df['Tags'] = df['Tags'].str.replace('>', ' ')
    df['Tags'] = df['Tags'].str.replace('-', ' ')
    df['Tags'] = df['Tags'].str.split(' ')

    cvec = CountVectorizer()
    corpus = newposts['Tags'].tolist()
    tags_vec = cvec.fit_transform(corpus)
    tokens = cvec.get_feature_names()
    wm2df(tags_vec, tokens)
    newposts.insert(4, 'TagsVec', tags_vec)

    alltags = pd.DataFrame(0, index=np.arange(1), columns=tokens)

    for tag in df.iloc[0]['Tags']:
        alltags[tag] = 1

    q_tags_added = pd.concat([df, alltags], axis=1)

    q_tags_added = q_tags_added.iloc[:, :-1]
    q_tags_added['Content'] = q_tags_added[['Title', 'Question']].apply(lambda x: ' '.join(x), axis=1)
    q_tags_added['Content'] = q_tags_added['Content'].str.lower().str.split()

    q_vecList = []
    for index, row in q_tags_added.iterrows():
        train_corpus = list(read_corpus(row['Content']))
        model = gensim.models.doc2vec.Doc2Vec(vector_size=100, min_count=1, epochs=30)
        model.build_vocab(train_corpus)
        model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)
        vector = model.infer_vector(row['Content'])
        q_vecList.append(vector)

    q_col_list = ['content' + str(x) for x in range(0, 100)]
    q_doc2vecdf = pd.DataFrame(q_vecList, columns=q_col_list)
    final_test = pd.concat([q_tags_added, q_doc2vecdf], axis=1)
    final_test = final_test.drop(axis=1,
                                 columns=["Content", "Question", "Title", "Creation Date", "Tags", "User Creation Date",
                                          "User Last Access Date"])

    final_test = final_test.reset_index()

    del final_test['index']

    final_test = final_test.replace(-9223372036854775808, 0)

    final_test.sort_index(axis=1, inplace=True)

    xtrain = shuffled_final.drop(axis=1, columns=['IsAnswered'])
    labels = shuffled_final['IsAnswered']

    rfm = RandomForestClassifier(bootstrap=True, n_estimators=100, min_samples_leaf=1,
                                 random_state=50, max_depth=50, min_samples_split=20)

    rfm.fit(xtrain, labels)

    ynew = rfm.predict_proba(final_test)
    # show the inputs and predicted outputs
    for i in range(len(final_test)):
        return ynew[i]


# returns the period of time that user will get an answer to the asked question
# this function uses data saved in Task2_when_will_my_question_get_answered.ipynb
# please read Task2_when_will_my_question_get_answered.ipynb to understand how this function/process works
# takes shuffled_time and new from Task1_will_my_question_get_answered

def timePer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
            derived_userCreationDate, derived_userLastAccessDate, derived_title, derived_question, derived_tags):
    # load shuffled dataframe as pandas
    shuffled = pd.read_pickle("CQA_FRONTEND/static/data/shuffled_time")
    # load new dataframe as pandas
    new = pd.read_pickle("CQA_FRONTEND/static/data/new")

    cvec = CountVectorizer()
    corpus = new['Tags'].tolist()
    tags_vec = cvec.fit_transform(corpus)
    tokens = cvec.get_feature_names()
    wm2df(tags_vec, tokens)
    new.insert(4, 'TagsVec', tags_vec)

    df = pd.DataFrame(
        {'Question': [derived_question], 'Title': [derived_title], 'Creation Date': [derived_creation_date],
         'Tags': [derived_tags], 'Reputation': [derived_userReputation],
         "User Creation Date": [derived_userCreationDate], "User Last Access Date": [derived_userLastAccessDate],
         "Views": [derived_userViews], "UpVotes": [derived_userUpVotes], "DownVotes": [derived_userDownVotes]})

    df['Creation Date'] = pd.to_datetime(df['Creation Date'])
    df['User Creation Date'] = pd.to_datetime(df['User Creation Date'])
    df['User Last Access Date'] = pd.to_datetime(df['User Last Access Date'])
    df['DownVotes'] = df['DownVotes'].astype(int)
    df['UpVotes'] = df['UpVotes'].astype(int)
    df['Reputation'] = df['Reputation'].astype(int)
    df['Views'] = df['Views'].astype(int)

    search = "Wh"

    df["isQuestionwh"] = df["Title"].str.startswith(search).astype(int)
    df['isWeekend'] = pd.to_datetime(df['Creation Date']).dt.dayofweek
    df["isWeekend"] = (df["isWeekend"] < 5).astype(int)

    df["Creation Date"] = df["Creation Date"].apply(get_part_of_day)
    df["User Creation Date"] = df["User Creation Date"].apply(get_part_of_day)
    df["User Last Access Date"] = df["User Last Access Date"].apply(get_part_of_day)

    df["CreationDate_1"], df["CreationDate_2"], df["CreationDate_3"] = zip(*df['Creation Date'].map(encoder))
    df["UserCreationDate_1"], df["UserCreationDate_2"], df["UserCreationDate_3"] = zip(
        *df['User Creation Date'].map(encoder))
    df["UserLastAccessDate_1"], df["UserLastAccessDate_2"], df["UserLastAccessDate_3"] = zip(
        *df['User Last Access Date'].map(encoder))

    df['Tag Count'] = df['Tags'].str.count('<')
    df['QuestionLength'] = df['Question'].str.len()
    df['IsQuestion'] = np.where(df['Title'].str.strip().str[-1] == '?', '1', '0')

    df['Tags'] = df['Tags'].str.replace('<', ' ')
    df['Tags'] = df['Tags'].str.replace('>', ' ')
    df['Tags'] = df['Tags'].str.replace('-', ' ')
    df['Tags'] = df['Tags'].str.split(' ')

    alltags = pd.DataFrame(0, index=np.arange(1), columns=tokens)
    for tag in df.iloc[0]['Tags']:
        alltags[tag] = 1

    q_tags_added = pd.concat([df, alltags], axis=1)

    q_tags_added = q_tags_added.iloc[:, :-1]

    q_tags_added['Content'] = q_tags_added[['Title', 'Question']].apply(lambda x: ' '.join(x), axis=1)
    q_tags_added['Content'] = q_tags_added['Content'].str.lower().str.split()

    q_vecList = []

    for index, row in q_tags_added.iterrows():
        train_corpus = list(read_corpus(row['Content']))
        model = gensim.models.doc2vec.Doc2Vec(vector_size=100, min_count=1, epochs=30)
        model.build_vocab(train_corpus)
        model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)
        vector = model.infer_vector(row['Content'])
        q_vecList.append(vector)

    q_col_list = ['content' + str(x) for x in range(0, 100)]
    q_doc2vecdf = pd.DataFrame(q_vecList, columns=q_col_list)
    final_test = pd.concat([q_tags_added, q_doc2vecdf], axis=1)
    final_test = final_test.drop(axis=1, columns=["Question", "Title", "Creation Date", "Tags", "User Creation Date",
                                                  "User Last Access Date"])

    final_test = final_test.drop(axis=1, columns=["Content"])
    final_test = final_test.reset_index()
    del final_test['index']
    final_test = final_test.replace(-9223372036854775808, 0)
    final_test.sort_index(axis=1, inplace=True)

    xtrain = shuffled.drop(axis=1, columns=['diff_in_minutes'])
    labels = shuffled['diff_in_minutes']

    X_resampled, y_resampled = ADASYN().fit_resample(xtrain, labels)

    rfm = RandomForestClassifier(bootstrap=True, n_estimators=100, min_samples_leaf=1,
                                 random_state=50, max_depth=50, min_samples_split=20, class_weight="balanced")

    rfm.fit(X_resampled, y_resampled)

    ynew = rfm.predict_proba(final_test.to_numpy())
    # show the inputs and predicted outputs
    timeList = ["0 - 5 hours", "5 - 24 hours", "1 - 2 days", "2 - 3 days", " 3 - 4 days"]

    """for i in range(len(final_test)):
            return ynew[i]"""
    return timeList[ynew.tolist()[0].index(max(ynew.tolist()[0]))]


def wm2df(wm, feat_names):
    # create an index for each row
    doc_names = ['Doc{:d}'.format(idx) for idx, _ in enumerate(wm)]
    df = pd.DataFrame(data=wm.toarray(), index=doc_names,
                      columns=feat_names)
    return (df)
