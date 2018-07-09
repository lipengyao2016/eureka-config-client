let co = require('co');
const EurekaClient =require('../eurekaClient/eurekaClient');

function getRegisterData(enurekaClient,config) {

    let curCtx = this;
    console.log(curCtx);

    let allApps = enurekaClient.getAllInstances();

    let hiRet =  enurekaClient.getInstancesByAppId('MenuServer');

   //console.log('getRegisterData hiRet:' + JSON.stringify(hiRet,null,2));

   let koaRet =  enurekaClient.getInstancesByVip('KOATWOSERVERXX');

    //console.log('getRegisterData koaRet:' + JSON.stringify(koaRet,null,2));
}

let config = {host:'23'};

let foo = {name:'gaga'};

let koaTwoEurekaClient = new EurekaClient('testServer',null,'6002'
    ,'192.168.7.26','192.168.7.26',8761,getRegisterData,foo,[config]);

koaTwoEurekaClient.registerService().then(data=>{
    console.log('register data:' + data);

   /* setTimeout(() => {
      koaTwoEurekaClient.unRegisterService().then(data=>{
         console.log('unregister data:' + data);
      });
    }, 1000);*/

});