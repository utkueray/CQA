// user accessToken, and Stack Exchange ID
let accessToken = localStorage.getItem("accessToken");
let accountID = localStorage.getItem("accountID");
let selectedSiteID = ""

// APIKEY registered to this app by Stack Exchange
let APIKEY = "unCQQDAhgl)qZ4GZRXVVGQ((";

// user data that will be used for both api calls and for parameters for machine learning models
let userData = {
    accessToken: accessToken,
    accountID: accountID,
    APIKEY: APIKEY,
    sites: {},
    derived_userReputation: 0,
    derived_userViews: 0,
    derived_userUpVotes: 0,
    derived_userDownVotes: 0,
    derived_userCreationDate: 0,
    derived_userLastAccessDate: 0,
    selectedSite: "",
    selectedSiteParam: "ai",
    selectedSiteID: "",
}

// select top 500 tags since more than that slows down website in current state
let sampleTags = stackOverFlowTags.slice(0, 500);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// find the parameter for the appropriate site such as Stack Overflow -> stackoverflow
userData.selectedSite = "https://stackoverflow.com"

for (let i = 0; i < sitesData.length; i++) {

    if (userData.selectedSite === sitesData[i].site_url) {
        //console.log(sitesData[i])

        userData.selectedSiteParam = sitesData[i].api_site_parameter

    }
}


if (accountID != null || accessToken != null) {

    $.getJSON("https://api.stackexchange.com/2.2/users/" + accountID + "/associated?filter=!*K3Z9x9w-2fKbidf&key=" + APIKEY, function (data_account) {
        //data is the JSON string
        let items = data_account.items;
        for (let i = 0; i < items.length; i++) {
            if (!(items[i].site_name in userData.sites)) {
                userData.sites[items[i].site_url] = items[i].user_id
                //console.log(items[i])
            }
        }

        selectedSiteID = userData.sites[userData.selectedSite]
        userData.selectedSiteID = selectedSiteID
        $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "?order=desc&sort=reputation&site=" + userData.selectedSiteParam + "&filter=!-*jbN*IioeFP&key=" + APIKEY, function (data_user) {
            //data is the JSON string
            $("#avatarImage").attr("src", " https://proxy.duckduckgo.com/iu/?u=" + data_user.items[0].profile_image);
            $("#accountType").text(capitalizeFirstLetter(data_user.items[0].user_type));
            $("#userName").text(data_user.items[0].display_name);
            $("#userQuestions").text(data_user.items[0].question_count);
            $("#userAnswers").text(data_user.items[0].answer_count);
            $("#userRep").text(data_user.items[0].reputation);

            userData.derived_userReputation = data_user.items[0].reputation;
            userData.derived_userViews = data_user.items[0].view_count;
            userData.derived_userUpVotes = data_user.items[0].up_vote_count;
            userData.derived_userDownVotes = data_user.items[0].down_vote_count;
            userData.derived_userCreationDate = data_user.items[0].creation_date;
            userData.derived_userLastAccessDate = data_user.items[0].last_access_date;

            $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "/questions?order=desc&sort=activity&site=" + userData.selectedSiteParam + "&key=" + APIKEY, function (data_question) {

                if (data_question.items.length !== 0) {
                    let html = '<div class="d-sm-flex align-items-center justify-content-between mb-4"><h1 class="h3 mb-0 text-gray-800">Asked Questions</h1></div><div id="questionsWrapper"></div>'

                    $('#content-user-questions').append(html);

                    let json_str = JSON.stringify(data_question);
                    setCookie('data_question', json_str, 100);

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
                }
            });

            $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "/answers?order=desc&sort=activity&site=" + userData.selectedSiteParam + "&filter=!)s4ZC4Clxhenq7j1nk6d&key=" + APIKEY, function (data_answer) {
                if (data_answer.items.length !== 0) {

                    let html = '<div class="d-sm-flex align-items-center justify-content-between mb-4"><h1 class="h3 mb-0 text-gray-800">Answered Questions</h1></div><div id="answersWrapper"></div>'

                    $('#content-user-questions').append(html);
                    let json_str = JSON.stringify(data_answer);

                    setCookie('data_answer', json_str, 100);

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
                }
                let json_str = JSON.stringify(userData);
                setCookie('userData', json_str, 100);


            });

        });
    });

} else {

    alert("Please login with StackExchange account.")
    window.location = "/"
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}
