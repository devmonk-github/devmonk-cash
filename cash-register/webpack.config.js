const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "cashRegister",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  plugins: [
    new ModuleFederationPlugin({

        // For remotes (please adjust)
        name: "cashRegister",
        filename: "remoteEntry.js",
        exposes: {
          './CashRegisterModule': './src/app/till/till.module.ts',
          './TransactionModule': './src/app/transactions/transactions.module.ts',
          './StatisticModule': './src/app/statistics/statistics.module.ts',
        },

        // For hosts (please adjust)
        // remotes: {
        //     "mfe1": "mfe1@http://localhost:3000/remoteEntry.js",

        // },

        shared: share({
          "@angular/core": { singleton: true, requiredVersion: 'auto' },
          "@angular/common": { singleton: true, requiredVersion: 'auto' },
          "@angular/common/http": { singleton: true, requiredVersion: 'auto' },
          "@angular/router": { singleton: true, requiredVersion: 'auto' },
          "@ngx-translate/core": { singleton: true, requiredVersion: 'auto' },

          ...sharedMappings.getDescriptors()
        })

    }),
    new ModuleFederationPlugin({

      // For remotes (please adjust)
      name: "till",
      filename: "till.js",
      exposes: {
        './tillModule': './src/app/till/till.module.ts',
        '/TransactionsModule': './src/app/transactions/transactions.module.ts',
        '/StatisticsModule': './src/app/statistics/statistics.module.ts',
      },

      // For hosts (please adjust)
      // remotes: {
      //     "mfe1": "mfe1@http://localhost:3000/remoteEntry.js",

      // },

      shared: share({
        "@angular/core": { singleton: true, requiredVersion: 'auto' },
        "@angular/common": { singleton: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, requiredVersion: 'auto' },
        "@angular/router": { singleton: true, requiredVersion: 'auto' },

        ...sharedMappings.getDescriptors()
      })

  }),
    sharedMappings.getPlugin()
  ],
};
