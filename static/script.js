// Collapsible
var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }

    });
}

function getTime() {
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let time = hours + ":" + minutes;
    return time;
}

function getEdit() 
{
  var question = document.getElementById('datalistOptionsInput').value
  document.getElementById('editableQuestion').value = question

  var combineResponse = "";
  for(var res in response)
  {
    combineResponse += response[res] + "\n"
  }
    document.getElementById('responsesTextarea').value = combineResponse
}

function updateQuestion()
{
    var updatdeQuestion = ""
    var updatedResponses = ""
   
    var tag = document.getElementById('searchTag').value

    if(questionChange)
    {
      updatedQuestion = document.getElementById("editableQuestion").value
    }

    if(responseChange)
    {
      updatedResponses = document.getElementById("responsesTextarea").value
    }

    updatedJSON = {pattern:updatedQuestion,responses:updatedResponses,tag:tag}

    var options = {
                    method:'POST',
                    headers: 
                    {
                      'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(updatedJSON)
                  }
    fetch("/api/updateQuestion",options).then(() => {
        if(response.status !== 200)
        {
            console.log(response.status)
            return ;
        }

        response.json().then((data) => {
            console.log("Successfully Updated")
        })
    })
  }

// Gets the first message
function firstBotMessage() {
    let firstMessage = "Hi this is ChatterBot"
    document.getElementById("botStarterMessage").innerHTML = '<p class="botText"><span>' + firstMessage + '</span></p>';

    let time = getTime();

    $("#chat-timestamp").append(time);
    document.getElementById("userInput").scrollIntoView(false);
}

firstBotMessage();

// Retrieves the response
const getHardResponse = async (userText) => { 
    let botResponse = await getBotResponse(userText)
    console.log("Bot Response"+botResponse);
    let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
    $("#chatbox").append(botHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);
}

//Gets the text text from the input box and processes it
function getResponse() {
    let userText = $("#textInput").val();

    if (userText == "") {
        userText = " ";
    }

    let userHtml = '<p class="userText"><span>' + userText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    setTimeout(() => {
        getHardResponse(userText);
    }, 1000)

}

// Handles sending text via button clicks
function buttonSendText(sampleText) {
    let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    //Uncomment this if you want the bot to respond to this buttonSendText event
    // setTimeout(() => {
    //     getHardResponse(sampleText);
    // }, 1000)
}

function sendButton() {
    getResponse();
}

function heartButton() {
    buttonSendText("Heart clicked!")
}

// Press enter to send a message
$("#textInput").keypress(function (e) {
    if (e.which == 13) {
        getResponse();
    }
});

const getBotResponse = async(input) => {
    try{
    let res = await fetch("http://127.0.0.1:5000/" + '/predict',{
            method: 'POST',
            body: JSON.stringify({message: input}),
            mode: 'cors',
            headers:{
                'Content-Type': 'application/json'
            },
        });
    let r = await res.json();
            console.log("Get Bot Response "+r.answer);
            return r.answer
    }
    catch(error) { 
            console.error('Error:',error);
        }
}