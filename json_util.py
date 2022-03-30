import json

def addQuestion(pattern,response,tag):
    file = open("./test.json","r+")
    data = json.load(file)
    flag = False
    for intent in data['intents']:
        if tag not in intent['tag']:
            flag = True

    if flag:
        entry = {"tag":tag,"pattern":pattern,"response":response}
        data['intents'].append(entry)
        file.seek(0)
        json.dump(data,file,indent=4)

pattern = ["This is my question."]
responses = ["This is answer"]
tag = "test"

def getTagList():
    file = open("./test.json","r")
    data = json.load(file)
    tags = []
    for intent in data['intents']:
        tags.append(intent['tag'])
    return tags

#addQuestion(pattern,responses,tag)
#getTagList()