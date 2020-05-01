from django.shortcuts import render
import pandas as pd
import gensim, json
from sklearn.ensemble import RandomForestClassifier
from datetime import datetime


# user date pulled from stackexchange API
now = datetime.now()

derived_creation_date = datetime.now().isoformat()


# Create your views here.

def test(request):
    return render(request, 'test.html')


def home(request):
    return render(request, 'index.html')


def dashboard(request):
    return render(request, 'dashboard.html')


def askQuestions(request):
    return render(request, 'askQuestion.html')


def answerQuestions(request):
    return render(request, 'answerQuestion.html')


def results(request, derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
            derived_userCreationDate, derived_userLastAccessDate, derived_title, derived_question, derived_tags):
    title = derived_title.replace("_", " ", len(derived_title))
    question = derived_question.replace("_", " ", len(derived_title))
    tags = derived_tags

    derived_userCreationDateFormat = datetime.fromtimestamp(derived_userCreationDate).isoformat()
    derived_userLastAccessDateFormat = datetime.fromtimestamp(derived_userLastAccessDate).isoformat()

    doc = title + question + tags

    model = gensim.models.doc2vec.Doc2Vec.load("CQA_FRONTEND/static/data/doc2vecmodel")
    test_corpus = list(read_corpus([doc], tokens_only=True))
    inferred_vector = model.infer_vector(test_corpus[0])
    sims = model.docvecs.most_similar([inferred_vector], topn=30)

    resultDict = {}

    for (key, val) in sims:
        resultDict[key] = val

    answerPercentage = \
    willAnswerPer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
                  derived_userCreationDateFormat, derived_userLastAccessDateFormat, title, question, tags)[1]
    return render(request, 'results.html', context={'resultDict': resultDict, 'answerPercentage': answerPercentage})


def read_corpus(fname, tokens_only=False):
    for i, line in enumerate(fname):
        tokens = gensim.utils.simple_preprocess(line)
        if tokens_only:
            yield tokens
        else:
            # For training data, add tags
            yield gensim.models.doc2vec.TaggedDocument(tokens, [i])


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


def willAnswerPer(derived_userReputation, derived_userViews, derived_userUpVotes, derived_userDownVotes,
                  derived_userCreationDate, derived_userLastAccessDate, derived_title, derived_question, derived_tags):
    # create a new data frame

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
    df['Tag Count'] = df['Tags'].str.count('<')

    df["CreationDate_1"], df["CreationDate_2"], df["CreationDate_3"] = zip(*df['Creation Date'].map(encoder))
    df["UserCreationDate_1"], df["UserCreationDate_2"], df["UserCreationDate_3"] = zip(
        *df['User Creation Date'].map(encoder))
    df["UserLastAccessDate_1"], df["UserLastAccessDate_2"], df["UserLastAccessDate_3"] = zip(
        *df['User Last Access Date'].map(encoder))

    df['Tags'] = df['Tags'].str.replace('<', '')
    df['Tags'] = df['Tags'].str.replace('>', ' ')
    df['Tags'] = df['Tags'].str.replace('-', ' ')
    df['Tags'] = df['Tags'].str.split(' ')

    test_tagsvecList = []
    for index, row in df.iterrows():
        train_corpus = list(read_corpus(row['Tags']))
        model = gensim.models.doc2vec.Doc2Vec(vector_size=100, min_count=1, epochs=30)
        model.build_vocab(train_corpus)

    for _ in df.iterrows():
        model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)
        vector = model.infer_vector([])
        test_tagsvecList.append(vector)

    test_col_list = ['tags' + str(x) for x in range(0, 100)]

    doc2vecdf_test = pd.DataFrame(test_tagsvecList, columns=test_col_list)
    test_df = pd.concat([df, doc2vecdf_test], axis=1)

    test_df.replace(-9223372036854775808, 0)
    test_df['Question'] = test_df['Question'].str.lower().str.split()

    testcontentvecList = []
    for _, row in test_df.iterrows():
        train_corpus = list(read_corpus(row['Question']))
        model = gensim.models.doc2vec.Doc2Vec(vector_size=100, min_count=1, epochs=30)
        model.build_vocab(train_corpus)
        model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)
        vectortestcontent = model.infer_vector([])
        testcontentvecList.append(vectortestcontent)

    testcontent_col_list = ['content' + str(x) for x in range(0, 100)]

    doc2vecdf_testcontent = pd.DataFrame(testcontentvecList, columns=testcontent_col_list)
    final_test = pd.concat([test_df, doc2vecdf_testcontent], axis=1)

    final_test = final_test.drop(axis=1, columns=["Question", "Title", "Tags"])
    final_test = final_test.drop(axis=1, columns=["Creation Date", "User Creation Date", "User Last Access Date"])

    shuffled_final = pd.read_pickle("CQA_FRONTEND/static/data/shuffled_final")
    xtrain = shuffled_final.drop(axis=1, columns=['IsAnswered'])
    labels = shuffled_final['IsAnswered']

    rfm = RandomForestClassifier(bootstrap=True, n_estimators=100, min_samples_leaf=1,
                                 random_state=50, max_depth=50, min_samples_split=20)

    rfm.fit(xtrain, labels)

    # fit final model
    rfm = RandomForestClassifier(bootstrap=True, n_estimators=100, min_samples_leaf=1,
                                 random_state=50, max_depth=50, min_samples_split=20)

    rfm.fit(xtrain, labels)

    yNew = rfm.predict_proba(final_test)
    # show the inputs and predicted outputs
    for i in range(len(final_test)):
        #print(" Predicted=%s" % (yNew[i]))
        return yNew[i]
