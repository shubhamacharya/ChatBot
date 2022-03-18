import random
import json
import torch
import subprocess

from model import NeuralNet
from nltk_pkg import bag_of_words, tokenize

all_words = []

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"

try: # To check for the availablity of training file
    data = torch.load(FILE)

    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data['all_words']
    tags = data['tags']
    model_state = data["model_state"]

    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()

    bot_name = "ChatterBot"

except FileNotFoundError: #If there is no training file then call the train.py script
    subprocess.call("python3 ./train.py", shell=True)

def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() >= 0.70:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    elif prob.item() >= 0.60 and prob.item() < 0.70:
        for intent in intents['intents']:
                if tag == intent["tag"]:
                    do_you_mean = "Do you mean " + random.choice(intent['patterns'])
                    return do_you_mean
    else:
        return "I am unable to understand...."


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)

