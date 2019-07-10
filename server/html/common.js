function displayError(text) {
    $(`
    <div class="alert alert-danger alert-dismissible">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        <strong>${text}</strong>
    </div>`).prependTo('#content');
}

function displaySuccess(text) {
    $(`
    <div class="alert alert-success alert-dismissible">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        <strong>${text}</strong>
    </div>`).prependTo('#content');
}