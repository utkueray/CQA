let idDict = resultDict;

let verifCount = 0;
let sortedIDArr = [];

let apiData = null;
let scoreArr = [];

function swap(json) {
    var ret = {};
    for (var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

async function getData() {

    if (idDict != null) {
        let queryS = "https://api.stackexchange.com/2.2/questions/";
        let queryE = "?order=desc&sort=activity&site=ai&key=" + APIKEY;
        for (let key in idDict) {
            queryS = queryS + key + ';';
        }


        // generate a query string
        queryS = queryS.slice(0, -1) + queryE;
        // GET query results as data obj
        $.getJSON(queryS, function (data) {

            let scoreDict = {};
            let sortedScoreDict = {};
            apiData = data;
            // generate score array and score dict key = score, value = id
            for (let i = 0; i < data.items.length; i++) {
                scoreArr.push(idDict[data.items[i].question_id]);
                scoreDict[idDict[data.items[i].question_id]] = data.items[i].question_id;
            }

            // sort score values
            scoreArr.sort(function (a, b) {
                return b - a;
            });

            // sorted score dict key = score, value = id
            for (let i = 0; i < data.items.length; i++) {
                sortedScoreDict[scoreArr[i]] = scoreDict[scoreArr[i]];
            }


            for (let i = 0; i < data.items.length; i++) {
                sortedIDArr.push(sortedScoreDict[scoreArr[i]]);
            }

            for (let i = 0; i < data.items.length; i++) {
                if (data.items[i].is_answered) {
                    verifCount = verifCount + 1;
                }
            }

            dataTable(data)
            /*
            $('#pagination-demo').twbsPagination({
                totalPages: data.items.length / 5,
                visiblePages: 5,
                next: 'Next',
                prev: 'Prev',
                onPageClick: function (event, page) {

                    jQuery('#page-content').html('');
                    for (let i = (page * 5) - 5; i < page * 5; i++) {

                        let title = "";
                        let link = "";
                        let score = 0;
                        let date;
                        for (let j = 0; j < scoreArr.length; j++) {
                            if (sortedIDArr[i] === data.items[j].question_id) {
                                title = data.items[j].title;
                                link = data.items[j]["link"];
                                score = idDict[sortedIDArr[i]];
                                date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                                accepted_answer_id = data.items[j].accepted_answer_id;
                                answer_count = data.items[j].answer_count;
                                question_id = data.items[j].question_id;
                            }
                        }
                        if (accepted_answer_id !== undefined) {
                            $('#page-content')
                                .append(
                                    $('<div>').addClass('card shadow mb-4 card').append(
                                        $('<div>').addClass('card-header py-3').append(
                                            $('<h5>').addClass('card-header').text(Math.round(score * 10000) / 100 + "%"),
                                            $('<a>').addClass('m-0 font-weight-bold text-success btn stretched-link').text(title).attr('href', link).attr('target', '_blank'),
                                            $('<div>').addClass('card-footer text-muted').text(date)
                                        )
                                    )
                                );
                        } else if (answer_count > 0) {
                            $('#page-content')
                                .append(
                                    $('<div>').addClass('card shadow mb-4 card').append(
                                        $('<div>').addClass('card-header py-3').append(
                                            $('<h5>').addClass('card-header').text(Math.round(score * 10000) / 100 + "%"),
                                            $('<a>').addClass('m-0 font-weight-bold text-warning btn stretched-link').text(title).attr('href', link).attr('target', '_blank'),
                                            $('<div>').addClass('card-footer text-muted').text(date)
                                        )
                                    )
                                );

                        } else {
                            $('#page-content')
                                .append(
                                    $('<div>').addClass('card shadow mb-4').append(
                                        $('<div>').addClass('card-header py-3').append(
                                            $('<h5>').addClass('card-header').text(Math.round(score * 10000) / 100 + "%"),
                                            $('<a>').addClass('m-0 font-weight-bold text-danger btn stretched-link').text(title).attr('href', link).attr('target', '_blank'),
                                            $('<div>').addClass('card-footer text-muted').text(date)
                                        )
                                    )
                                );
                        }

                    }
                }
            });
            */

        });
    }
}

$(document).ready(function () {
    // executes when HTML-Document is loaded and DOM is ready
    getData()
});


function dataTable(data) {

    let title = "";
    let link = "";
    let score = 0;
    let date;
    console.log(data)
    for (let j = 0; j < data.items.length; j++) {
        title = data.items[j].title;
        link = data.items[j]["link"];
        question_id = data.items[j].question_id;
        score = Math.round(idDict[question_id] * 10000) / 100;
        date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
        accepted_answer_id = data.items[j].accepted_answer_id;
        answer_count = data.items[j].answer_count;
        if (accepted_answer_id !== undefined) {

        $('#tbody-results').append(
            $('<tr>').attr('href', link).attr('target', '_blank').append(
                $('<td>').addClass('m-0 font-weight-bold text-success').text(score + "%"),
                $('<td>').html(title),
                $('<td>').text(date)
            ))
        } else if (answer_count > 0) {

        $('#tbody-results').append(
            $('<tr>').attr('href', link).attr('target', '_blank').append(
                $('<td>').addClass('m-0 font-weight-bold text-warning').text(score + "%"),
                $('<td>').html(title),
                $('<td>').text(date)
            ))

        } else {

        $('#tbody-results').append(
            $('<tr>').attr('href', link).attr('target', '_blank').append(
                $('<td>').addClass('m-0 font-weight-bold text-danger').text(score + "%"),
                $('<td>').html(title),
                $('<td>').text(date)
            ))
        }
    }


    $('#dt-filter-select').dataTable({
        order: [[0, "desc"]],
        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                var select = $('<select  class="browser-default custom-select form-control-sm"><option value="" selected>All</option></select>')
                    .appendTo($(column.footer()).empty())
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

    $('#example tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
}
