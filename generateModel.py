import numpy as np
import xml.etree.ElementTree as et
import pandas as pd, re
from bs4 import BeautifulSoup
import gensim
from markdown import markdown

# parse posts.xlm to xml tree
xtree = et.parse('Posts.xml')

xroot = xtree.getroot()

print("XML tree generated.")

dfCols = ["Closed Date", "Favorite Count", "Comment Count", "Answer Count", "Tags", "Title",
          "Last Activity Date", "Owner User ID", "Body", "View Count", "Score", "Creation Date", "Post Type ID", 
          "ID", "Parent ID", "Last Edit Date", "Last Editor User ID", "Accepted Answer ID"]
dfRows = []

for node in xroot:
    closedDate = node.attrib.get("ClosedDate")
    favCount = node.attrib.get("FavoriteCount")
    commentCount = node.attrib.get("CommentCount")
    ansCount = node.attrib.get("AnswerCount")
    tags = node.attrib.get("Tags")
    title = node.attrib.get("Title")
    lastActDate = node.attrib.get("LastActivityDate")
    ownerUserID = node.attrib.get("OwnerUserId")
    body = node.attrib.get("Body")
    viewCount = node.attrib.get("ViewCount") 
    score = node.attrib.get("Score") 
    creationDate = node.attrib.get("CreationDate") 
    postTypeID = node.attrib.get("PostTypeId") 
    ID = node.attrib.get("Id") 
    parentID = node.attrib.get("ParentId") 
    lastEditDate = node.attrib.get("LastEditDate") 
    lastEditorUserID = node.attrib.get("LastEditorUserId") 
    acceptedAnswerID = node.attrib.get("AcceptedAnswerID")
    
    dfRows.append({"Closed Date": closedDate, "Favorite Count": favCount, "Comment Count": commentCount,
                     "Answer Count": ansCount, "Tags": tags, "Title": title, "Last Activity Date": lastActDate,
                     "Owner User ID": ownerUserID, "Body": body, "View Count": viewCount, "Score": score, 
                    "Creation Date": creationDate, "Post Type ID": postTypeID, "ID": ID, "Parent ID": parentID,
                    "Last Edit Date": lastEditDate, "Last Editor User ID": lastEditorUserID, "Accepted Answer ID": acceptedAnswerID})

print("Dataframe generated.")


out = pd.DataFrame(dfRows, columns=dfCols)

out = out.fillna(0)

out['Creation Date'] = pd.to_datetime(out['Creation Date'])
out['Creation Date'] = out['Creation Date'].dt.strftime('%Y/%m/%d')
out['Comment Count'] = out['Comment Count'].astype(int)
out['Owner User ID'] = out['Owner User ID'].astype(int)
out['Post Type ID'] = out['Post Type ID'].astype(int)
out['Score'] = out['Score'].astype(int)
out['Favorite Count'] = out['Favorite Count'].astype(int)
out['Answer Count'] = out['Answer Count'].astype(int)
out['View Count'] = out['View Count'].astype(int)

answers = out[(out['Post Type ID'] == 1)]

answers = answers[['ID','Creation Date','Tags','Title','Body']]

#words kolonu title ile bodynin birleşmiş hali, 
answers['Words'] = answers[['Title', 'Body', 'Tags']].apply(lambda x: ' '.join(x), axis=1)

answers['Words'].apply(lambda x: ''.join(BeautifulSoup(markdown(x)).findAll(text=True)))

size = len(answers['ID'].to_list())

id_set = answers.ID.to_list() #Documents

def read_corpus(fname, tokens_only=False):
    for i, line in enumerate(fname):
        tokens = gensim.utils.simple_preprocess(line)
        if tokens_only:
            yield tokens
        else:
            # For training data, add tags
            yield gensim.models.doc2vec.TaggedDocument(tokens, [int(id_set[i])])

trainData =answers['Words'].tolist()

print("Preparing train corpus.")

train_corpus = list(read_corpus(trainData))

print("Initializing the doc2vec model.")

model = gensim.models.doc2vec.Doc2Vec(min_count=1,window=5,vector_size=300,workers=5,alpha=0.025,min_alpha=0.00025,dm=1, epochs = 50)

model.build_vocab(train_corpus)

print("Training the doc2vec model...")

model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)

path = "CQA_FRONTEND/static/data/doc2vecmodel"

print("Model saved to ", path)

model.save(path)