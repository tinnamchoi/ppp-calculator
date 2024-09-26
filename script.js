const min = 2;
let counter = 0;

let data = {};
let countries = document.createElement('select');

let last_change = 0;

function update(element) {
    let id = parseInt(element.id.split('_'));
    let index = id[1];

    if (id[0] == 'amount') last_change = index;

    let original_country = document.getElementById('country_' + last_change.toString());
    original_country = original_country.options[original_country.selectedIndex].value;
    let original_amount = document.getElementById('amount_' + last_change.toString()).value;

    for (let i = 0; i < counter; i++) {
        if (i == last_change) continue;
        let country = document.getElementById('country_' + i.toString());
        country = country.options[country.selectedIndex].value;
        let amount = document.getElementById('amount_' + i.toString());
        amount.value = Math.round(original_amount * data[country].ppp / data[original_country].ppp * 100) / 100;
    }

    document.getElementById("example").innerHTML = "Example: " + document.getElementById("amount_0").value + " in " + document.getElementById("country_0").value + " has the same purchasing power as " + document.getElementById("amount_1").value + " in " + document.getElementById("country_1").value + " in their respective local currencies.";
}

function inc() {
    let tag = document.createElement('div');

    // Country
    tag.appendChild(document.createElement('label'));
    tag.lastChild.textContent = 'Country ' + (counter + 1).toString() + ': ';

    let select = countries.cloneNode(true);
    let option = select.firstChild;
    option.disabled = true;
    option.selected = true;
    select.id = 'country_' + counter.toString();
    select.onchange = function() { update(this); }
    tag.appendChild(select);

    //
    tag.appendChild(document.createElement('br'));
    tag.appendChild(document.createElement('br'));

    // Amount
    tag.appendChild(document.createElement('label'));
    tag.lastChild.textContent = 'Amount: ';

    let input = document.createElement('input');
    input.type = 'number';
    input.classList.add('field');
    input.id = 'amount_' + counter.toString();
    input.onchange = function() { update(this); }
    input.value = 0;
    tag.appendChild(input);

    //
    tag.classList.add('child');
    tag.style.flex = '1';
    let element = document.getElementById('container');
    element.appendChild(tag);

    counter++;
}

function dec() {
    if (counter == min) return;
    let element = document.getElementById('container');
    element.removeChild(element.lastChild);
    counter--;
}

async function get_data() {
    const per_page = 16384;
    let page = 1;
    let ans = {};

    try {
        while (true) {
            const response = await fetch(`https://api.worldbank.org/v2/country/all/indicator/PA.NUS.PPP?format=json&per_page=${per_page}&page=${page}`);
            const data = await response.json();

            if (!data || !data[1] || data[1].length === 0) break;

            data[1].forEach(x => {
                if (x.value != null) {
                    const country = x.country.value;
                    const date = x.date;
                    const ppp = x.value;
                    if (!ans[country] || date > ans[country].date) {
                        ans[country] = { ppp, date };
                    }
                }
            });

            ++page;
        }

        return ans;
    } catch (error) {
        console.log("Failed to fetch data from the World Bank API", error);
        return {};
    }
}

function create_select() {
    countries = document.createElement('select');
    countries.classList.add('field');
    countries.appendChild(document.createElement('option'));
    for (let country in data) {
        let option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countries.appendChild(option);
    }
}

window.onload = async () => {
    data = await get_data();
    console.log(data);
    create_select();
    while (counter < min) {
        inc();
    }
    document.getElementById('country_0').selectedIndex = 82;
    document.getElementById('country_1').selectedIndex = 10;
    document.getElementById('amount_0').value = 50000;
    update(document.getElementById('amount_0'));
}
