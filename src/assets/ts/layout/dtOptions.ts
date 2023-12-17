export const getDtLatvian = () => {
    return {
        processing: "Uzgaidi ...",
        search: "",
        lengthMenu: "_MENU_",
        infoEmpty: "Nav ierakstu",
        infoFiltered: "(atlasīts no _MAX_ ierakstiem)",
        loadingRecords: "Notiek ielāde ...",
        zeroRecords: "Nekas nav atrasts",
        emptyTable: "Tabulā nav datu",
        paginate: {
            first: '<i class="first"></i>',
            previous: '<i class="previous"></i>',
            next: '<i class="next"></i>',
            last: '<i class="last"></i>',
        },
        aria: {
            sortAscending: ": aktivizēt kolonnu, lai kārtotu augoši",
            sortDescending: ": aktivizēt kolonnu, lai kārtotu dilstoši",
        },
        autoFill: {
            cancel: "Atcelt",
        },
        buttons: {
            collection: "Saraksts",
            colvis: "Pievienot - noņemt kolonnas",
            copy: "Kopēt",
            csv: "CSV",
            excel: "Excel",
            pdf: "PDF",
            print: "Printēt",
            copyTitle: "Kopēt starpliktuvē",
        },
        searchBuilder: {
            add: "Pievienot",
            clearAll: "Attīrīt visu",
        },
        info: "Atlasīti _START_ līdz _END_ no _TOTAL_",
        searchPlaceholder: "Meklēt",
        select: {
            cells: {
                "1": "atlasīta 1 šūna",
                "0": "",
                _: "atlasītas %d šūnas",
            },
            columns: {
                "1": "atlasīta 1 kolonna",
                "0": "",
                _: "atlasītas %d kolonnas",
            },
            rows: {
                "1": "atlasīta 1 rinda",
                "0": "",
                _: "atlasītas %d rindas",
            },
        },
        datetime: {
            previous: "Iepriekšējais",
            next: "Nākamais",
            hours: "Stunda",
            minutes: "Minūte",
            seconds: "Sekunde",
            unknown: "-",
            amPm: ["am", "pm"],
            weekdays: ["Pr", "Ot", "Tr", "Ce", "Pk", "Se", "Sv"],
            months: [
                "Janvāris",
                "Februāris",
                "Marts",
                "Aprīlis",
                "Maijs",
                "Jūnijs",
                "Jūlijs",
                "Augusts",
                "Septembris",
                "Oktobris",
                "Novembris",
                "Decembris",
            ],
        },
        editor: {
            close: "Aizvērt",
            create: {
                button: "Izveidot",
                title: "Izveidot jaunu ierakstu",
                submit: "Izveidot",
            },
            edit: {
                button: "Rediģēt",
                title: "Rediģēt ierakstu",
                submit: "Atjaunot",
            },
            remove: {
                button: "Izdzēst",
                title: "Izdzēst",
                submit: "Izdzēst",
                confirm: {
                    _: "Vai tiešām dzēst %d rindas?",
                    "1": "Vai tiešām dzēst 1 rindu?",
                },
            },
            error: {
                system:
                    'Kļūda sistēmā (<a target="\\" rel="nofollow" href="\\">Vairāk informācijas<\/a>).',
            },
            multi: {
                title: "Vairākas izvēles",
                restore: "Atsaukt izmaiņas",
            },
        },
    };
};

const focusInput = (settings) => {
    const id = settings.sTableId;
    const filter_div = document.getElementById(id + "_filter");

    if (filter_div) {
        const filter_input = filter_div.getElementsByTagName("input")[0];
        filter_input.focus();
    }
}

export const getDtOptions = (focus = 0, stateSave = true) => {
    let options = {
        pageLength: 50,
        stateSave: stateSave,
        language: getDtLatvian(),
        dom:
            "<'row'<'col-sm-12 col-md-6'f>><'table-responsive'tr><'row'<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'li><'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>>",
    };

    options["initComplete"] = function(settings, json) {
        if (focus) {
            focusInput(settings);
        }
    }

    return options;
};

export const transformDtSource = (source: any, options = {}): any => {
    let result = {};

    for (let key in source) {
        const headers: string[] = [];
        const columns: { data: string }[] = [];

        const currentSource = source[key];
        const currentOptions = options[key] || {};

        for (let innerKey in currentSource) {
            headers.push(currentSource[innerKey]);

            // Start with the base column definition
            const columnDef = { data: innerKey };

            // If there are options for this column, merge them in
            if (currentOptions[innerKey]) {
                Object.assign(columnDef, currentOptions[innerKey]);
            }

            columns.push(columnDef);
        }

        result[key as string] = {
            headers,
            columns,
        };
    }

    return result;
};

export const handleSelect = (dt: any, indexes: any[]): any[] => {
    return dt.rows(indexes).data().toArray();
};

export const serverSide = (loadData) => {
    return async function (data, callback, settings) {
        const queryInfo = {
            draw: data.draw,
            start: data.start,
            length: data.length,
            search: data.search,
            order: data.order,
            columns: data.columns,
            dtServerSide: true
        };

        const result = await loadData(queryInfo);

        callback(result);
    };
}