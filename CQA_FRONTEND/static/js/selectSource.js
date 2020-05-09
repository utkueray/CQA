$(".dropdown-menu li a").click(function () {
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    selectedSource = $(this).text()
});

if (selectedSource !== "") {

    $(".dropdown-menu li a").parents(".dropdown").find('.btn').html(selectedSource + ' <span class="caret"></span>')
    $(".dropdown-menu li a").parents(".dropdown").find('.btn').val(selectedSource);

}
