exports.ParamsToJSON = function ParamsToJSON(req) {
    var filtro = '{';

    for (var param in req.params) {
        if (req.params.hasOwnProperty(param)) {
            if (req.params[param] != '' && req.params[param] != null && req.params[param] != undefined) {
                filtro += '\"' + param + '\"' + ':' + '\"' + req.params[param] + '\"' + ',';
                //console.log(param, req.params[param]);
            }
        }
    }
    //filtro = filtro.replace('undefined', '')
    filtro = filtro.slice(0, -1);
    filtro = filtro + '}';

    var o = JSON.parse(filtro);

    console.log(o);

    return o;
}
