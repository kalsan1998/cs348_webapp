// This will automatically insert the header file into all other html files
function loadHeader(id) {
    $('#header-load').load('header.html', () => {
        // Make navbar item appear as "active"
        $(`#${id}`).addClass('active');
    });
}

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