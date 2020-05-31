// gets bool value of option1 which tells us if user selected test mode or not
if (getCookie("option1")) {
    $("#selector :input")[0].checked = true;
    $("#selector :input")[1].checked = false;

    $('#option1Label').addClass("active")
    $('#option2Label').removeClass("active")

} else {
    $("#selector :input")[0].checked = false;
    $("#selector :input")[1].checked = true;
    $('#option1Label').removeClass("active")
    $('#option2Label').addClass("active")
}

// user accessToken, and Stack Exchange ID
let accessToken = localStorage.getItem("accessToken");
let selectedSiteID = ""
let accountID = ""

// APIKEY registered to this app by Stack Exchange
let APIKEY = "unCQQDAhgl)qZ4GZRXVVGQ((";

// change accountID depending on if test mode is selected or not
if ($("#selector :input")[0].checked) {
    console.log("Test Mode Activated");
    accountID = "4148701"
} else {
    console.log("Test Mode Deactivated");
    accountID = localStorage.getItem("accountID");
}

// set accountID and option1 bool when user select test mode: on or off
$("#selector :input").change(function () {
    if (this.id === "option1") {
        console.log("Test Mode Activated");
        accountID = "4148701"
        setCookie("option1", true, 99)

    } else {
        console.log("Test Mode Deactivated");
        accountID = localStorage.getItem("accountID");
        setCookie("option1", false, 99)
    }
    location.reload();

});

// user data that will be used for both api calls and for parameters of machine learning models
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

// get tags from stored js file for suggesting user while typing an existing tag
let sampleTags = aiStackExchangeTags;

// capitalizing strings function
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// find the parameter for the appropriate site such as Stack Overflow -> stackoverflow
// since the website works on Artificial Intelligence website of Stack Exchange, currently it is static, will be dynamic in the future
userData.selectedSite = "https://ai.stackexchange.com"

// fill userData with the data of currently active site
for (let i = 0; i < sitesData.length; i++) {
    if (userData.selectedSite === sitesData[i].site_url) {
        userData.selectedSiteParam = sitesData[i].api_site_parameter
    }
}

// last check point before retrieving user data, check for accountID and accessToken before API calls.
if (accountID != null || accessToken != null) {

    // API call for user data on Stack Exchange
    $.getJSON("https://api.stackexchange.com/2.2/users/" + accountID + "/associated?pagesize=50&filter=!*K3Z9x9w-2fKbidf&key=" + APIKEY, function (data_account) {
        let items = data_account.items;
        for (let i = 0; i < items.length; i++) {
            if (!(items[i].site_name in userData.sites)) {
                // save user information on the registered sites
                userData.sites[items[i].site_url] = items[i].user_id
            }
        }

        // can let user select the prefered site dynamically in the future, it's currently static
        selectedSiteID = userData.sites[userData.selectedSite]
        userData.selectedSiteID = selectedSiteID

        $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "?order=desc&sort=reputation&site=" + userData.selectedSiteParam + "&filter=!-*jbN*IioeFP&key=" + APIKEY, function (data_user) {

            // set user data on the dashboard page
            $("#avatarImage").attr("src", " https://proxy.duckduckgo.com/iu/?u=" + data_user.items[0].profile_image);
            $("#accountType").text(capitalizeFirstLetter(data_user.items[0].user_type));
            $("#userName").text(data_user.items[0].display_name);
            $("#userQuestions").text(data_user.items[0].question_count);
            $("#userAnswers").text(data_user.items[0].answer_count);
            $("#userRep").text(data_user.items[0].reputation);

            // save relevant information about user to userData dictionary
            userData.derived_userReputation = data_user.items[0].reputation;
            userData.derived_userViews = data_user.items[0].view_count;
            userData.derived_userUpVotes = data_user.items[0].up_vote_count;
            userData.derived_userDownVotes = data_user.items[0].down_vote_count;
            userData.derived_userCreationDate = data_user.items[0].creation_date;
            userData.derived_userLastAccessDate = data_user.items[0].last_access_date;

            // API call for getting questions that user asked
            $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "/questions?order=desc&sort=activity&site=" + userData.selectedSiteParam + "&key=" + APIKEY, function (data_question) {
                // goes in if user has asked questions previously
                if (data_question.items.length !== 0) {
                    // add title to the page
                    let html = '<div class="d-sm-flex align-items-center justify-content-between mb-4"><h1 class="h3 mb-0 text-gray-800">Asked Questions</h1></div><div id="questionsWrapper"></div>'
                    $('#content-user-questions').append(html);

                    // save question data as cookie for future usage in other pages and in backend
                    let json_str = JSON.stringify(data_question);
                    setCookie('data_question', json_str, 100);

                    // display user questions in card format
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

            // API call for getting questions that user answered
            $.getJSON("https://api.stackexchange.com/2.2/users/" + userData.selectedSiteID + "/answers?order=desc&sort=activity&site=" + userData.selectedSiteParam + "&filter=!)s4ZC4Clxhenq7j1nk6d&key=" + APIKEY, function (data_answer) {
                // goes in if user has answered questions previously
                if (data_answer.items.length !== 0) {

                    // add title to the page
                    let html = '<div class="d-sm-flex align-items-center justify-content-between mb-4"><h1 class="h3 mb-0 text-gray-800">Answered Questions</h1></div><div id="answersWrapper"></div>'
                    $('#content-user-questions').append(html);

                    // save question data as cookie for future usage
                    let json_str = JSON.stringify(data_answer);
                    setCookie('data_answer', json_str, 100);

                    // display questions in card format
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

                // save userData dictionary as cookie to use it in other pages and in the backend if necessary
                let json_str = JSON.stringify(userData);
                setCookie('userData', json_str, 100);


            });

        });
    });

} else {
    // alert and move user to index page
    alert("Please login with StackExchange account.")
    window.location = "/"
}

// set and get cookie functions
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


