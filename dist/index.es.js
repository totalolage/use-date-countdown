import { useState, useEffect } from 'react';

var useMyHook = function () {
    var _a = useState({
        counter: 0
    }), counter = _a[0].counter, setState = _a[1];
    useEffect(function () {
        var interval = window.setInterval(function () {
            counter++;
            setState({ counter: counter });
        }, 1000);
        return function () {
            window.clearInterval(interval);
        };
    }, []);
    return counter;
};

export { useMyHook };
//# sourceMappingURL=index.es.js.map
