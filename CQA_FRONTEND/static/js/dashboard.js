let accessToken = localStorage.getItem("accessToken");
let accountID = localStorage.getItem("accountID");
let APIKEY = "unCQQDAhgl)qZ4GZRXVVGQ((";

let stackOverflowID = "";
let mainData = null;

let derived_userReputation = 0;
let derived_userViews = 0;
let derived_userUpVotes = 0;
let derived_userDownVotes = 0;
let derived_userCreationDate = 0;
let derived_userLastAccessDate = 0;

var userData = {
    accessToken: accessToken,
    accountID: accountID,
    stackOverflowID: 0,
    derived_userReputation: 0,
    derived_userViews: 0,
    derived_userUpVotes: 0,
    derived_userDownVotes: 0,
    derived_userCreationDate: 0,
    derived_userLastAccessDate: 0,

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

if (accountID != null || accessToken != null) {

    $.getJSON("https://api.stackexchange.com/2.2/users/" + accountID + "/associated?filter=!*K3Z9x9w-2fKbidf&key=" + APIKEY, function (data_account) {
        //data is the JSON string
        mainData = data_account;
        let items = data_account.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].site_name === "Stack Overflow") {
                stackOverflowID = items[i].user_id;
                userData.stackOverflowID = items[i].user_id;
            }
        }
        $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowID + "?order=desc&sort=reputation&site=stackoverflow&filter=!-*jbN*IioeFP&key=" + APIKEY, function (data_user) {
            //data is the JSON string
            $("#avatarImage").attr("src", " https://proxy.duckduckgo.com/iu/?u=" + data_user.items[0].profile_image);
            $("#accountType").text(capitalizeFirstLetter(data_user.items[0].user_type));
            $("#userName").text(data_user.items[0].display_name);
            $("#userQuestions").text(data_user.items[0].question_count);
            $("#userAnswers").text(data_user.items[0].answer_count);
            $("#userRep").text(data_user.items[0].reputation);

            derived_userReputation = data_user.items[0].reputation;
            derived_userViews = data_user.items[0].view_count;
            derived_userUpVotes = data_user.items[0].up_vote_count;
            derived_userDownVotes = data_user.items[0].down_vote_count;
            derived_userCreationDate = data_user.items[0].creation_date;
            derived_userLastAccessDate = data_user.items[0].last_access_date;

            userData.derived_userReputation = data_user.items[0].reputation;
            userData.derived_userViews = data_user.items[0].view_count;
            userData.derived_userUpVotes = data_user.items[0].up_vote_count;
            userData.derived_userDownVotes = data_user.items[0].down_vote_count;
            userData.derived_userCreationDate = data_user.items[0].creation_date;
            userData.derived_userLastAccessDate = data_user.items[0].last_access_date;

            $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowID + "/questions?order=desc&sort=activity&site=stackoverflow&key=" + APIKEY, function (data_question) {

                for (let i = 0; i < data_question.items.length; i++) {
                    let title = data_question.items[i].title;
                    let d = document.createElement('div');
                    d.innerHTML = data_question.items[i].title;
                    title = d.innerText;
                    let link = data_question.items[i].link;

                    if (data_question.items[i].accepted_answer_id != null) {
                        $("#questionsWrapper")
                            .append(
                                $('<div>').addClass('card shadow mb-4').append(
                                    $('<div>').addClass('card-header py-3').append(
                                        $('<a>').addClass('m-0 font-weight-bold text-success btn stretched-link').text(title).attr('href', link).attr('target', '_blank')
                                    )
                                )
                            );
                    } else {
                        $("#questionsWrapper")
                            .append(
                                $('<div>').addClass('card shadow mb-4').append(
                                    $('<div>').addClass('card-header py-3').append(
                                        $('<a>').addClass('m-0 font-weight-bold btn stretched-link').text(title).attr('href', link).attr('target', '_blank')
                                    )
                                )
                            );
                    }

                }

            });

             $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowID + "/answers?order=desc&sort=activity&site=stackoverflow&filter=!)s4ZC4Clxhenq7j1nk6d&key=" + APIKEY, function (data_answer) {
                    console.log(data_answer)
                for (let i = 0; i < data_answer.items.length; i++) {
                    let title = data_answer.items[i].title;
                    let d = document.createElement('div');
                    d.innerHTML = data_answer.items[i].title;
                    title = d.innerText;
                    let link = data_answer.items[i].link;

                    if (data_answer.items[i].accepted_answer_id != null) {
                        $("#answersWrapper")
                            .append(
                                $('<div>').addClass('card shadow mb-4').append(
                                    $('<div>').addClass('card-header py-3').append(
                                        $('<a>').addClass('m-0 font-weight-bold text-success btn stretched-link').text(title).attr('href', link).attr('target', '_blank')
                                    )
                                )
                            );
                    } else {
                        $("#answersWrapper")
                            .append(
                                $('<div>').addClass('card shadow mb-4').append(
                                    $('<div>').addClass('card-header py-3').append(
                                        $('<a>').addClass('m-0 font-weight-bold btn stretched-link').text(title).attr('href', link).attr('target', '_blank')
                                    )
                                )
                            );
                    }

                }

            });

        });
    });

}

