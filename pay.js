;(async () => {

    function post(endpoint, data) {
        return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
            xhr.onload = function() {
              resolve(JSON.parse(this.responseText))
            }
        })
    }

    if (window.nano === undefined) {
        window.nano = {}
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      window.nano.dark_mode = true
    }


    window.nano.cancel = (element) => {
        document.getElementById('nano-pay').remove()
        clearInterval(window.nano.check)
    }
    
    window.nano.success = (element, data) => {
        var existing = document.getElementById('nano-pay')
        var template = `<div id="nano-pay" style="position: fixed;width: 100%;height: 100%;background:${window.nano.dark_mode ? '#000' : '#FFF'};z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;color: #FFF;font-size: 30px;"> <img src="/img/success.svg" style="max-width: 120px;filter: saturate(2);"> <div style="color: ${window.nano.dark_mode ? '#FFF' : '#000'}; margin: 40px;opacity:1;">Complete</div><div style="cursor: pointer; font-size: 21px; padding: 10px 25px; background: #1f9ce9; color: #FFF; min-width: 120px; text-align: center; border-radius: 5px;" onclick="window.nano.cancel(); return">Done</div> <div style=" border-radius: 0; padding: 10px 25px; color: ${window.nano.dark_mode ? '#FFF' : '#000'};; margin-top: 24px; opacity: 0.4; font-size: 17px; ">View Block</div></div>`;
        existing.innerHTML = template;
        var all = document.querySelectorAll(element);
        for (var i=0, max=all.length; i < max; i++) {
            all[i].querySelector('.nano-locked').remove()
        }
    }

    window.nano.request = (setting) => {
        post('https://api.nano.to', { address: setting.address, amount: setting.amount || setting.price }).then((data) => {
            var template = `<div id="nano-pay" style="position: fixed;width: 100%;height:100%;background:${window.nano.dark_mode ? '#000' : '#FFF'};z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;color: #FFF;font-size: 30px;"><div style="margin: 10px 0;font-size: 30px;color: #1f9ce9;">${ setting.title && setting.title !== 'undefined' ? setting.title : 'Nano.to Pay'}</div><img src="${data.qrcode}" style="max-width: 150px;border: 8px solid #1f9ce9;margin-top: 20px;border-radius: 10px;"> <div style="margin: 30px 0;opacity: 0.8;font-size: 22px;letter-spacing: 1px;color:${window.nano.dark_mode ? '#FFF' : '#000'}">${data.amount} NANO</div> <div style=" background: #1f9ce9; font-size: 21px; border-radius: 5px; padding: 10px 25px; color: #FFF; ">Open Wallet</div> <div onclick="window.nano.cancel(); return" style=" border-radius: 0; padding: 10px 25px; color:${window.nano.dark_mode ? '#FFF' : '#000'}; margin-top: 24px; opacity: 0.4; font-size: 17px; ">Cancel</div></div>`;
            document.body.innerHTML += template;
        })
    }

    window.nano.unlock = (element, amount, address, title, color) => {
        post('https://api.nano.to', { address, amount }).then((data) => {
            var template = `<div id="nano-pay" style="position: fixed;width: 100%;height:100%;background:${window.nano.dark_mode ? '#000' : '#FFF'};z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;color: #FFF;font-size: 30px;"><div style="margin: 10px 0 15px 0;font-size: 30px;color:${color && color !== 'undefined' ? color : '#1f9ce9;'}">${ title && title !== 'undefined' ? title : 'Nano.to Pay'}</div><img src="${data.qrcode}" style="max-width: 150px;border: 8px solid #1f9ce9;margin-top: 20px;border-radius: 10px;"> <div style="margin: 30px 0;opacity: 1;font-size: 22px;letter-spacing: 1px;color:${window.nano.dark_mode ? '#FFF' : '#000'}">${data.amount} NANO</div> <div style=" background: #1f9ce9; font-size: 21px; border-radius: 5px; padding: 10px 25px; color: #FFF; ">Open Wallet</div> <div onclick="window.nano.cancel(); return" style=" border-radius: 0; padding: 10px 25px; color:${window.nano.dark_mode ? '#FFF' : '#000'}; margin-top: 24px; opacity: 0.4; font-size: 17px; ">Cancel</div></div>`;
            document.body.innerHTML += template;
            var checks = 0
            setTimeout(() => {
                window.nano.check = setInterval(async () => {
                    // console.log("Check")
                    if (checks > 2) {
                        window.nano.success(element)
                        clearInterval(window.nano.check)
                    } else {
                        console.log("Check")
                        // success
                    }
                    checks++
                }, 2000)
                // clearInterval(window.nano.check)
            }, 2000)
        })
    }

    window.nano.ppv = (config) => {

        if (typeof config === 'string' && config.includes('nano_')) {
            config = { address: config }
        } else {
            config = config || {}
        }

        // if (!window.nano.address && !config.address) return console.error('Nano: NANO payment address missing:', config.element)

        if (!config.address || !config.address.includes('nano_')) return console.error('Nano: NANO payment address invalid:', config.element)

        if (!config.element) return console.error('Nano: No premium element provided:', config.element)
        if (!config.amount) return console.error('Nano: No price provided:', config.element)
        
        var all = document.querySelectorAll(config.element);

        for (var i=0, max=all.length; i < max; i++) {
            
            var item = all[i]
            
            // item.style['min-height'] = "150px"; 
            item.style.position = "relative"; 
            
            let code = `<div class="nano-locked" style="position: absolute;background:${config.background || '#000'};width: 100%;height: 100%;top: 0;left: 0;bottom: 0;right: 0;font-size: 24px;min-height: 110px;display: flex;align-items: center;flex-direction: column;justify-content: center; color: ${config.color || '#FFF'}">
    <div>
        ${ config.text || 'Unlock for ' + config.amount + ' NANO' }
    </div>
    <div onclick="window.nano.unlock('${config.element}', '${config.amount}', '${config.address}', '${config.title}', '${config.color}')" style="cursor: pointer; padding: 7px 25px; border-radius: 4px; margin: 10px 0; display: flex; align-items: center; justify-content: center; font-size: 22px; background: #FFF; color: ${config.color || '#000'}">
        <img style="max-width: 24px; margin-right: 8px" src="/img/xno.svg" alt="">
        ${ config.button || 'Purchase' }
    </div>
</div>`

            item.innerHTML += code

            window.nano.config = config

        }

    }

})();