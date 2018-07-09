
const Eureka = require('eureka-js-client').Eureka;
const ipUtils = require('../common/ipUtils');
const _ = require('lodash');
var inflection = require( 'inflection' );



class EurekaClient  {
    constructor(appName,appIp,appPort,vipName,eurekaServerHost,eurekaServerPort,registryUpdateFunc,registryFuncCtx
    ,funcParams,heartbeatInterval,registryFetchInterval) {

        this.bDebug = false;

        if(this.bDebug) {
            console.log('ServiceRegister->constructor heartbeatInterval:' + heartbeatInterval
                + ',registryFetchInterval:' + registryFetchInterval);
        }



        if(!appIp)
        {
            appIp = ipUtils.getLocalIP();
            console.log('ServiceRegister->constructor getLocal Ip appIp:' + appIp );
        }

        this.appName = appName = inflection.underscore(appName);
        this.appIp = appIp;
        this.appPort = appPort;
        this.eurekaServerHost = eurekaServerHost;
        this.eurekaServerPort = eurekaServerPort;
        this.registryUpdateFunc = registryUpdateFunc;
        this.vipName = vipName;
        
        this.appDataInfo = `${appName}_${appIp}:${appPort}`;

        this.client = new Eureka({
            instance: {
                instanceId: `${appIp}_${appName}`,
                app: appName,
                hostName: appIp,
                ipAddr: appIp,
              /*  statusPageUrl: 'http://localhost:7000/info/',
                healthCheckUrl: 'http://localhost:7000/health/',*/
                port: {
                    '$': appPort,
                    '@enabled': 'true',
                },
                vipAddress: vipName,
                dataCenterInfo: {
                    '@class':  'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name: 'MyOwn',
                },
            },
            eureka: {
                host: eurekaServerHost,
                port: eurekaServerPort,
                servicePath: '/eureka/apps/',
                heartbeatInterval:heartbeatInterval,
                registryFetchInterval:registryFetchInterval,
            },
            /*  eureka: {
                  serviceUrls: ['http://192.168.7.6:8761/eureka/apps/'],
              },*/
        });

        let ctx = this;

        ctx.client.on('started', function(data) {
            if(this.bDebug)
            {
                console.log('eureka has started,data' + data);
            }

        });

        ctx.client.on('registered', function(data) {
            if(this.bDebug)
            {
                console.log('registered: ' + data);
            }

        });

        ctx.client.on('deregistered', function(data) {
            if(this.bDebug) {
                console.log('deregistered: ' + data);
            }
        });

        ctx.client.on('heartbeat', function(data) {
            if(this.bDebug) {
                console.log('heartbeat: ' + data);
            }
        });


        ctx.client.on('registryUpdated', function(data) {
            if(this.bDebug) {
                console.log('registryUpdated: ' + data);
            }
            if(registryUpdateFunc)
            {
                let args = [];
                args.push(ctx);
                args = args.concat(funcParams);
                registryUpdateFunc.apply(registryFuncCtx,args);
            }
        });

    };

    async registerService()
    {
        let ctx = this;
        return  await  new Promise(function (resolve, reject) {
            ctx.client.start(function(error) {
                if(error){
                    console.error('register Eureka failed,appDataInfo: ' + ctx.appDataInfo);
                    reject(error);
                }else{
                    console.log('register Eureka success,appDataInfo: ' + ctx.appDataInfo);
                    resolve(ctx.appDataInfo);
                }
            });
        })
    };

    async unRegisterService()
    {
        let ctx = this;
        return  await  new Promise(function (resolve, reject) {
            ctx.client.stop(function(error,data) {
                if(error){
                    console.error('unRegister Eureka failed,error: ' + error);
                    reject(error);
                }else{
                    console.log('unRegister Eureka success,data: ' + data);
                    resolve(data);
                }
            });
        })
    };

    getAllInstances()
    {
        let srcAppInsts = this.client.cache.app;

        let appInsts = {};
         _.keys(srcAppInsts).map(app=>{
                appInsts[app] = srcAppInsts[app].map(appInst=>{
                 return {
                     app:appInst.app,
                     instanceId:appInst.instanceId,
                     host:appInst.ipAddr,
                     port:appInst.port.$,
                     vipAddress:appInst.vipAddress,
                 };
             });

        })

        return appInsts;
    }

    getInstancesByAppId(appId)
    {
        let hiServicsInsts = this.client.getInstancesByAppId(appId);

        let retInstances = hiServicsInsts.map(inst=>{
            return {
                app:inst.app,
                instanceId:inst.instanceId,
                host:inst.ipAddr,
                port:inst.port.$,
            };
        });

        if(this.bDebug) {
            console.log('getInstancesByAppId retInstances:' + JSON.stringify(retInstances, null, 2));
        }
        return retInstances;
    }


    getInstancesByVip(vip)
    {
        let hiServicsInsts = this.client.getInstancesByVipAddress(vip);

        let retInstances = hiServicsInsts.map(inst=>{
            return {
                app:inst.app,
                instanceId:inst.instanceId,
                host:inst.ipAddr,
                port:inst.port.$,
            };
        });

        if(this.bDebug) {
            console.log('getInstancesByVip retInstances:' + JSON.stringify(retInstances, null, 2));
        }
        return hiServicsInsts;
    }

}



module.exports = EurekaClient;









