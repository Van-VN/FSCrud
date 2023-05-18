const http = require("http");
const fs = require("fs");
const qs = require("qs");
const url = require("url");
const PORT = 8888;

const router = {};
let html = "";

router.showList = (req, res) => {
  fs.readFile("./FSCrud/view/index.html", "utf-8", (err, data) => {
    if (err) {
      console.log(err.message);
    } else {
      data = data.replace("{add-items-to-list}", html);
      res.write(data);
      res.end();
    }
  });
};

router.getData = async (req, res) => {
  let tempData = "";
  req.on("data", (chunk) => {
    tempData += chunk;
  });

  await req.on("end", () => {
    tempData = qs.parse(tempData);
    tempData = `${tempData.itemName},${tempData.itemPrice};`;
    fs.appendFile("./FSCrud/data.txt", tempData, () => {
      console.log(`Successfully Added File!`);
    });
    res.end();
  });
};

router.updateItem = async (req, res) => {
  let dataFiles = "";
  html = "";
  await fs.readFile("./FSCrud/data.txt", "utf-8", (err, data) => {
    if (err) {
      console.log(err.message);
    } else {
      dataFiles = data.split(";");
      dataFiles.forEach((item, index) => {
        item = item.split(",");
        html += `<tr>`;
        html += `<td>${index + 1}</td>`;
        html += `<td>${item[0]}</td>`;
        html += `<td>${item[1]}</td>`;
        html += `</tr>`;
        index++;
      });
    }
  });
  res.end();
};

const server = http.createServer((req, res) => {
  let urlFetch = url.parse(req.url).pathname.replace(/^\/+|\/+$/, "");
  switch (urlFetch) {
    case "products":
      if (req.method === "GET") {
        router.showList(req, res);
      } else if (req.method === "POST") {
        router.getData(req, res);
        res.writeHead(301, { location: "products" });
        router.updateItem(req, res);
      }
      break;
    default:
      res.end("Page Not Found!");
      break;
  }
});

server.listen(PORT, () => console.log(`Server started at Port ${PORT}`));
