const path = require("path");
const fs = require("fs-extra");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const pjson = require("./package.json");

function stripStartDirectories(targetPath, numDirs) {
  const p = targetPath.split("/");
  p.splice(0, numDirs);
  return p.join("/");
}

module.exports = (env) => {
  console.log(`ENV`, env);

  console.log(`env.output`, env.output);
  // const outputPath = env.output
  //   ? path.resolve(env.output, pjson.name)
  //   : path.resolve(__dirname, "../project/noodl_modules/" + pjson.name);
  const outputPath = path.resolve(env.output, pjson.name)
  return {
    entry: "./src/index.js",
    mode: "production",
    devtool: "source-map",
    output: {
      filename: "index.js",
      path: outputPath,
    },
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
    },
    resolve: {
      extensions: [".js", ".json", ".css"],
    },
    plugins: [
      new CleanWebpackPlugin(outputPath),
      new CopyWebpackPlugin([
        {
          from: "assets/**/*",
          transformPath: (targetPath) => stripStartDirectories(targetPath, 1),
        },
      ]),

      // Copy the generated module files to the tests project if it exists
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
            if (fs.existsSync(path.resolve(__dirname, "../tests"))) {
              fs.copySync(
                outputPath,
                path.resolve(__dirname, "../tests/noodl_modules/" + pjson.name)
              );
            }
          });
        },
      },
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { modules: false }],
                "@babel/preset-react",
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  };
};
