const EurekaClient  =require('./eurekaClient');
const _ = require('lodash');
const inflection = require( 'inflection' );

class EurekaClientConfig  {
    constructor(appName,config,heartbeatInterval = 30000,registryFetchInterval = 30000) {
        //console.log('EurekaClientConfig->constructor ' );
        this.eurekaClient = new EurekaClient(appName,null,config.server.port,config.server.domain
            ,config.eurekaServer.host,config.eurekaServer.port,this.refreshConfig,this,[config],heartbeatInterval,registryFetchInterval);
    };

    async registerService()
    {
        return await  this.eurekaClient.registerService();
    };

    refreshConfig(enurekaClient,config)
    {
      //  console.log('refreshConfig data');

        let eurekaApps = enurekaClient.getAllInstances();

        _.keys(eurekaApps).map(appName=>{
            let appInsts = eurekaApps[appName];

            let keyName = inflection.camelize(appName.toLowerCase());

            if(config[keyName] && appInsts.length > 0)
            {
               if(!_.isEqual(config[keyName].host,appInsts[0].vipAddress))
               {
                   console.log(`update ${keyName} from eureka server ,old Host:${config[keyName].host},new Host:${appInsts[0].vipAddress}`);
                   config[keyName].host = appInsts[0].vipAddress;
               }

                if(!_.isEqual(config[keyName].port,appInsts[0].port))
                {
                    console.log(`update ${keyName} from eureka server ,old port:${config[keyName].port},new port:${appInsts[0].port}`);
                    config[keyName].port = appInsts[0].port;
                }
            }
        });


        //config.redis.db =1;
    };

}


module.exports = EurekaClientConfig;

/*
console.log(inflection.underscore('MenuServer'));
console.log(inflection.camelize('menu_server'));*/



