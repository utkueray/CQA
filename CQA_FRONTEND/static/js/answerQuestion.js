let idDict;

userDataSaved = userData
//data is the JSON string
cookieUserData = JSON.parse(getCookie('userData'))
console.log(cookieUserData.selectedSiteID)
$.getJSON("https://api.stackexchange.com/2.2/users/" + cookieUserData.selectedSiteID + "/questions?order=desc&sort=activity&site=" + cookieUserData.selectedSiteParam + "&key=" + APIKEY, function (data_question) {
    for (let i = 0; i < 5; i++) {
        let title = data_question.items[i].title;
        let d = document.createElement('div');
        d.innerHTML = data_question.items[i].title;
        title = d.innerText;
        let link = data_question.items[i].link;
        let question_id = data_question.items[i].question_id;
        $("#suggestions").append(
            $('<div>').append(
                $('<div>').addClass('card shadow mb-4').append(
                    $('<a>').addClass('h5 font-weight-bold btn underline card-title primary-color').text(title).attr('href', link).attr('target', '_blank').css("text-align", "left").css("text-decoration", "underline"),
                    $('<div>').attr('id', 'table' + question_id).css('margin', '20px')
                ),
            )
        )
    }
    if (typeof resultDict !== 'undefined') {

        for (let ids in resultDict) {
            console.log(ids);

            if (resultDict[ids] != null) {

                let queryS = "https://api.stackexchange.com/2.2/questions/";
                let queryE = "?order=desc&sort=activity&site=" + cookieUserData.selectedSiteParam + "&key=" + APIKEY;
                for (let key in resultDict[ids]) {
                    queryS = queryS + key + ';';
                }
                // generate a query string
                queryS = queryS.slice(0, -1) + queryE;
                // GET query results as data obj
                console.log(queryS)
                $.getJSON(queryS, function (data) {
                    if (data.items.length === 0) {
                        console.log("There is no data to show.")
                        $("#similar-questions").remove();
                        $("#suggestion-questions").remove();

                    } else {
                        $("#table" + ids).append(
                            $('<table>').addClass("table").attr('id', 'dt-filter-select' + ids).append(
                                $('<thead>').append(
                                    $('<tr>').append(
                                        $('<th>').addClass('th-sm').text("Similarity"),
                                        $('<th>').addClass('th-sm').text("Title"),
                                        $('<th>').addClass('th-sm').text("Date"),
                                    )
                                ),
                                $('<tbody>').attr('id', ids),
                                $('<tfoot>').append(
                                    $('<tr>').append(
                                        //$('<th>').text("Similarity")
                                    )
                                )
                            )
                        )
                        let title = "";
                        let link = "";
                        let score = 0;
                        let date;

                        for (let j = 0; j < data.items.length; j++) {
                            idDict = resultDict[ids]
                            title = data.items[j].title;
                            link = data.items[j]["link"];
                            question_id = data.items[j].question_id;
                            score = Math.round(idDict[question_id] * 10000) / 100;
                            date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                            accepted_answer_id = data.items[j].accepted_answer_id;
                            answer_count = data.items[j].answer_count;
                            console.log(title)

                            $('#' + ids).append(
                                $('<tr>').attr('href', link).attr('target', '_blank').append(
                                    $('<td>').addClass('m-0 font-weight-bold').text(score + "%"),
                                    $('<td>').append(
                                        $('<a>').html(title).attr("href", link).attr("target", "_blank")
                                    ),
                                    $('<td>').text(date)
                                )
                            )
                        }

                        $('#dt-filter-select' + ids).dataTable({
                            order: [[0, "desc"]],
                            bFilter: true,
                            columnDefs: [
                                {
                                    targets: [2],
                                    render: function (data, type, row) {
                                        if (type === 'sort') {
                                            return Date.parse(data);
                                        }
                                        return data;
                                    }
                                },
                                {
                                    targets: [1],

                                }
                            ],
                            initComplete: function () {
                                this.api().columns().every(function () {
                                    var column = this;
                                    var select = $('<select  class="browser-default custom-select form-control-sm"><option value="" selected>All</option></select>')
                                        .appendTo($(column.footer()))
                                        .on('change', function () {
                                            var val = $.fn.dataTable.util.escapeRegex(
                                                $(this).val()
                                            );

                                            column
                                                .search(val ? '^' + val + '$' : '', true, false)
                                                .draw();
                                        });

                                    column.data().unique().sort().each(function (d, j) {
                                        select.append('<option value="' + d + '">' + d + '</option>')
                                    });

                                });
                            },
                        });

                    }
                });

            }
        }
    } else {
        console.log("User has no question.")
    }
});

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