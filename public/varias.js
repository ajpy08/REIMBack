exports.ParamsToJSON = function ParamsToJSON(req) {
    var json;
    var filtro = '{';
    if (req.params) {
        for (var param in req.params) {
            if (req.params.hasOwnProperty(param)) {
                //console.log(param, req.params[param]);
                if (req.params[param] != '' && req.params[param] != null && req.params[param] != 'undefined') {
                    filtro += '\"' + param + '\"' + ':' + '\"' + req.params[param] + '\"' + ',';                    
                } else {
                    console.log('No se agrego el param ' + param + ' al JSON');
                }
            } else {
                console.log('No se pudo el hasOwnProperty');
                // return;
            }
        }

        if(filtro != '{'){
            filtro = filtro.slice(0, -1);
            filtro = filtro + '}';
        }else{
            filtro = filtro + '}';
            //return;
        }
        //console.log(filtro)
        var json = JSON.parse(filtro);
        //console.log(json)
        //console.log(req.params);
    } else {
        console.log('La URL no tiene parametros');
        return;
    }

    return json;
}
