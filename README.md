# CQA

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Download the project by cloning the following link or download the zip version from Github.

```
https://github.com/utkueray/CQA.git
```

### Installing

After downloading the project file, you have to open a command line with Python 3.6.X or Python 3.8.X installed and navigate to the project folder.

You can install necessary python libraries with typing the following command in to your command line.

```
pip install -r requirements.txt
```
or

```
pip install -r requirements.txt --user
```

Also, you have to run the following script in command line to generate doc2vec model in the predefined path.

```
python generateModel.py
```

## Running

Running the system is fairly easy after installing necessary python libraries.
Enter the following command to your command line, or you can use a PyCharm which is tested and works fine.

```
python manage.py runserver 80
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
