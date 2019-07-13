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

// Make sure that the last item in the row is for edit/delete buttons
// submit_function_text should be something like "submit_venue".
// Columns that have index inside |except| will not be made editable.
// Columns with index inside |checkbox| will be turned into a checkbox instead
// of a textbox.
function makeRowEditable(row, submit_function_name, except=[], checkbox=[]) {
    // This will store the original values.
    const hidden_div = $(`
        <div style="display:none">
        </div>
    `);
    const entries = row.children();
    var i = 0;
    for (; i < entries.length - 1; ++i) {
        // Use .eq(i) instead of [i]
        // https://stackoverflow.com/questions/40462236/jquery-appends-as-text-instead-of-html
        const entry = entries.eq(i);
        hidden_div.append(entry.clone());

        if (except.includes(i)) continue;
        
        const current_text = entry.text();
        if (checkbox.includes(i)) {
            if (current_text === "Yes") {
                entry.html(`
                    <input type="checkbox" checked>
                `);
            } else {
                entry.html(`
                    <input type="checkbox">
                `);
            }
        } else {
            entry.html(`
                <input type="text" value="${current_text}">
            `);
        }
    }
    const buttons_td = entries.eq(i);
    hidden_div.append(buttons_td.clone());
    row.prepend(hidden_div);

    buttons_td.html(`
        <button class="btn submit-edit-btn" onclick="${submit_function_name}('${row.attr('entry_id')}')"><span class="fa fa-check"></span></button>
        <button class="btn cancel-edit-btn" onclick="revertRowEdit('${row.attr('entry_id')}')"><span class="fa fa-remove"></span></button>
    `);
}

function revertRowEdit(row_id) {
    const row = $(`tr[entry_id="${row_id}"`);
    const hidden_div = row.children().eq(0);
    row.children().remove();
    row.append(hidden_div.children());
}