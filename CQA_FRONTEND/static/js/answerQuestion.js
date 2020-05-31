// initialize userData by getting from cookie and saving to to a local variable
cookieUserData = JSON.parse(getCookie('userData'))
// do not display test mode options because it can cause bugs, just let user select the option on dashboard
document.getElementById("modeSelect").style.display = "none";

// API calls for questions that user asked before
$.getJSON("https://api.stackexchange.com/2.2/users/" + cookieUserData.selectedSiteID + "/questions?order=desc&sort=activity&site=" + cookieUserData.selectedSiteParam + "&key=" + APIKEY, function (data_question) {
    // generate individual sections for datatables that each question will have
    // display suggest title on the left top side of the card
    if (data_question.items.length !== 0) { // check if user has any questions
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
        $("#suggestions-oneforall").append(
            $('<div>').append(
                $('<div>').addClass('card shadow mb-4').append(
                    $('<div>').attr('id', 'table-suggestion').css('margin', '20px')
                ),
            )
        )
    } else {
        console.log("User has no question.")
    }
    if (typeof resultDict !== 'undefined') {

        for (let ids in resultDict) {
            console.log(ids);

            if (resultDict[ids] != null) {
                // make batch request to API
                let queryS = "https://api.stackexchange.com/2.2/questions/";
                let queryE = "?order=desc&sort=activity&site=" + cookieUserData.selectedSiteParam + "&key=" + APIKEY;
                for (let key in resultDict[ids]) {
                    queryS = queryS + key + ';';
                }
                // generate a query string
                queryS = queryS.slice(0, -1) + queryE;
                // GET query results as data obj
                $.getJSON(queryS, function (data) {
                    if (data.items.length === 0) {
                        console.log("There is no data to show.")
                        $("#similar-questions").remove();

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
                            title = data.items[j].title;
                            link = data.items[j]["link"];
                            question_id = data.items[j].question_id;
                            score = Math.round(resultDict[ids][question_id] * 10000) / 100;
                            date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                            accepted_answer_id = data.items[j].accepted_answer_id;
                            answer_count = data.items[j].answer_count;

                            // get add question datas to datatable : title, date, score, link
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

                        // initialize datatable
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

    if (typeof suggestions !== 'undefined') {

        if (suggestions != null) {

            // make a batch request to API with multiple question ids
            let queryS = "https://api.stackexchange.com/2.2/questions/";
            let queryE = "?order=desc&sort=activity&site=" + cookieUserData.selectedSiteParam + "&key=" + APIKEY;
            for (let key in suggestions) {
                queryS = queryS + key + ';';
            }
            // generate a query string
            queryS = queryS.slice(0, -1) + queryE;

            // get each questions data from API
            $.getJSON(queryS, function (data) {
                if (data.items.length === 0) {
                    console.log("There is no data to show.")
                    $("#suggestion-questions").remove();

                } else {
                    $("#table-suggestion").append(
                        $('<table>').addClass("table").attr('id', 'dt-filter-select-suggestion').append(
                            $('<thead>').append(
                                $('<tr>').append(
                                    $('<th>').addClass('th-sm').text("Similarity"),
                                    $('<th>').addClass('th-sm').text("Title"),
                                    $('<th>').addClass('th-sm').text("Date"),
                                )
                            ),
                            $('<tbody>').attr('id','dt-filter-select-suggestion-body'),
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
                        title = data.items[j].title;
                        link = data.items[j]["link"];
                        question_id = data.items[j].question_id;
                        score = Math.round(suggestions[question_id] * 10000) / 100;
                        date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                        accepted_answer_id = data.items[j].accepted_answer_id;
                        answer_count = data.items[j].answer_count;

                        // add data of each question to datatable: title, score, date and link
                        $('#' + 'dt-filter-select-suggestion-body').append(
                            $('<tr>').attr('href', link).attr('target', '_blank').append(
                                $('<td>').addClass('m-0 font-weight-bold').text(score + "%"),
                                $('<td>').append(
                                    $('<a>').html(title).attr("href", link).attr("target", "_blank")
                                ),
                                $('<td>').text(date)
                            )
                        )
                    }

                    // initialize datatable
                    $('#dt-filter-select-suggestion').dataTable({
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


    } else {
        console.log("User has no question.")
    }
});
