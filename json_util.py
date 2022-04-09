import json
from os import path,stat

def addQuestion(pattern,response,tag):
    file = open("./test.json","r+")
    data = json.load(file)
    
    flag = False
    tags = getTagList()

    try:
        index = tags.index(tag)
    except ValueError:
        flag = True

    if flag: #If tag not present in json file create new object
        entry = {"tag":tag,"pattern":pattern,"response":response}
        data['intents'].append(entry)
    else: #Else append to the tag
        data['intents'][index]['pattern'].extend(pattern)
        data['intents'][index]['response'].extend(response)
    
    file.seek(0)
    json.dump(data,file,indent=4)
    
    file.close()

def getTagList():
    file = open("./test.json","r")
    data = json.load(file)
    tags = []
    for intent in data['intents']:
        tags.append(intent['tag'])
    file.close()
    return tags

def getUnanswered():
    unansweredList = []
    if path.exists("./unanswered.json"):
        file = open("./unanswered.json","r")
        data = json.load(file)
        for ques in data['question']:
            unansweredList.extend(ques.keys())
    file.close()
    return unansweredList

def unansweredWriteJSON(unanswered):
    '''
    1.Add all unanswered question to the file with any flag.
        Flag will set when the question is answered by admin.
    2. Call addQuestion method to add or append the questions.
    3. Remove all the questions from file whoes flag is set.
    '''
    if not path.exists('./unanswered.json') or stat('./unanswered.json').st_size==0:
        print("Creating File 'unanswered.json'")
        file = open("./unanswered.json","w+")
        json.dump({"question":[]},file)
        file.close()
    else:
        unanswer = {unanswered[i]:0 for i in range(len(unanswered))}
        file = open("./unanswered.json","r+")
        data = json.load(file)
        data['question'].append(unanswer)
        print("Writing to the file 'unanswered.json'")
        file.seek(0)
        json.dump(data,file,indent=4)
        file.close()

#unanswered = ['this is question 1','this is question 2','this is question 3']
#unansweredQuestions(unanswered)

pattern = ['this is question 4','this is question 5','this is question 6']
response = ['this is common4']
tag = 'testing'
#unansweredWriteJSON(pattern)
getUnanswered()