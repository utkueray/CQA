let stackOverflowIDAQ = "";

if (accountID != null || accessToken != null) {

    $.getJSON("https://api.stackexchange.com/2.2/users/" + accountID + "/associated?filter=!*K3Z9x9w-2fKbidf&key=" + APIKEY, function (data_account) {
        //data is the JSON string
        let items = data_account.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].site_name === "Stack Overflow") {
                stackOverflowIDAQ = items[i].user_id;
                userData.stackOverflowIDAQ = items[i].user_id;
            }
        }
        $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowIDAQ + "?order=desc&sort=reputation&site=stackoverflow&filter=!-*jbN*IioeFP&key=" + APIKEY, function (data_user) {

            $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowIDAQ + "/questions?order=desc&sort=activity&site=stackoverflow&key=" + APIKEY, function (data_question) {
                console.log(data_question)
                for (let i = 0; i < data_question.items.length; i++) {
                    let title = data_question.items[i].title;
                    let d = document.createElement('div');
                    d.innerHTML = data_question.items[i].title;
                    title = d.innerText;
                    let link = data_question.items[i].link;

                    $("#suggestions")
                        .append(
                            $('<div>').addClass('card shadow mb-4').append(
                                $('<a>').addClass('h5 mb-0 mr-3 font-weight-bold btn stretched-link').text(title).attr('href', link).attr('target', '_blank')
                            )
                        )
                }
            });
        });
    });

} else {

    alert("Please login with StackExchange account.")
    window.location = "/"
}


if (qTitle !== "" && qText !== "" && tags !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/" + qText.split(' ').join('_').replace(/[?=]/g, "") + "/" + tags.split(' ').join('_') + "/"
    } else if (qTitle !== "" && qText !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/" + qText.split(' ').join('_').replace(/[?=]/g, "") + "/"
    } else if (qTitle !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/"
    }