# CQA

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

##Important Keynote

You may want to read more about this project before working on the coding part.

Regarding the third and fourth tasks, we used DOC2VEC after some data analysis and comparison. There is also an aspect of context in our project. We want to return the most similar question based on the user’s asked question. We selected random examples and examined the original question and the related ones. We concluded that DOC2VEC returns better results than TFIDF contextually. You can find the data regarding to why we chose DOC2VEC instead of TFIDF under DOC2VEC.ipynb and TFIDF.ipynb files. Around line 22 we showed how DOC2VEC returns more related questions than TFIDF. For more details please check the Final_Report.

### Prerequisites

Download the project by cloning the following link or download the zip version from Github.

```
https://github.com/utkueray/CQA.git
```

Please use Python3, if possible Python 3.6.X or Python 3.8.X version, assuming that it will work on Python 3.7.X but never tested it.

Also, please use version 3 of Pip while installing.

You may have to define Python and Pip version while running scripts, therefore becareful while copying commands.



### Installing

After downloading the project file, you have to open a command line with Python 3.6.X or Python 3.8.X installed and navigate to the project folder.

You can install necessary python libraries with typing the following command in to your command line.



```
pip install -r requirements.txt
```

or

```
pip3 install -r requirements.txt
```

Also, you have to run the following script in command line to generate doc2vec model in the predefined path.

```
python generateModel.py
```

or

```
python3 generateModel.py
```
## Running

Running the system is fairly easy after installing necessary python libraries.
Enter the following command to your command line, or you can use a PyCharm which is tested and works fine.

```
python manage.py runserver 80
```

or

```
python3 manage.py runserver 80
```

or ( if you are using MAC OS)

```
sudo python3 manage.py runserver 80
```
## Authors

* **Mehmet Utku Eray** - *Initial work* - [utkueray](https://github.com/utkueray)
* **Deniz Bozkurt** - *Initial work* - [DenizBozkurt](https://github.com/DenizBozkurt)
* **Zeynep Seda Birinci** - *Initial work* - [zseda](https://github.com/zseda)
* **Selen Özcan** - *Initial work* - [selenozcan](https://github.com/selenozcan)

## Copyright and License

Copyright 2019-2020 Sabanci University. Code released under the MIT license - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* [Sb-Admin-2](https://github.com/BlackrockDigital/startbootstrap-sb-admin-2)
* [Django](https://github.com/django/django)
* [Gensim](https://github.com/RaRe-Technologies/gensim)
