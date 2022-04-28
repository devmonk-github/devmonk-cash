import {Component, OnInit} from '@angular/core';
import {PdfService} from "../shared/service/pdf.service";
import {JsonEditorOptions} from "ang-jsoneditor";

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.sass']
})
export class PrintComponent implements OnInit {
  dataString: any
  templateString: any
  editorOptions: JsonEditorOptions = new JsonEditorOptions()
  pdfGenerating: boolean = false

  constructor(private pdfService: PdfService) {
    this.editorOptions.mode = 'view'
  }


  ngOnInit() {
    const templateString = {
      "barcodeheight":"10",
      "barcodetext":false,
      "barcodewidth":"auto",
      "currency":"€",
      "debug":false,
      "defaultElement":"span",
      "fontSize":"10pt",
      "margins":[5,5],
      "momentjs_dateformat":"",
      "name":"Gift Card",
      "orientation":"portrait",
      "paperSize":"A4",
      "pixelsPerMm":"3.76",
      "rotation":"0",
      "layout":[
        {
          "row":[
            {
              "size":"6",
              "html":"<img src=\"https://lirp.cdn-website.com/2568326e/dms3rep/multi/opt/Juwelier-Bos-208w.png\" />"
            },
            {
              "size":"6",
              "html":"[[shop.name]]<br/>[[shop.address.street]] [[shop.address.houseNumber]]<br/>[[shop.address.postalCode]] [[shop.address.city]]<br/>[[shop.phone.mobilePhone]]<br/>[[shop.email]]<br/>nl93RABO0302128743<br/>[[shop.financial.invoiceNumber]]<br/>NL123456789<br/>[[shop.domainDetails.domain]]",
              "css":{
                "text-align":"right",
                "color":"green"
              }
            }
          ],
          "css" :{
            "padding":[0,0,5,0]
          },
          "section":"meta"
        },
        {
          "row":[
            {
              "size":"12",
              "float":"left",
              "html":"Datum: [[receipt.dateCreated]]<br/>Erik Klop<br/>Bonnummer: [[receipt.number]]"
            }
          ],
          "css":{
            "padding":[0,0,5,0]
          },
          "section":"meta"
        },
        {
          "row":[
            {
              "size":"12",
              "float":"left",
              "html":"U bent geadviseerd door [[receipt.createdBy.name]]"
            }
          ],
          "css":{
            "padding":[0,0,10,0]
          },
          "section":"meta"
        },
        {
          "row":[
            {
              "size":"4",
              "html":[
                {
                  "element":"h3",
                  "content":"Test"

                }
              ]
            },
            {
              "size":"4",
              "html":[
                {
                  "element":"p",
                  "content":"[[quantity]] x [[name]]",
                  "css":{
                    "margin":[0,0,1,0]
                  }
                },
                {
                  "element":"p",
                  "content":"[[productNumber]]"

                },
                {
                  "element":"em",
                  "content":"[[comment]]",
                  "if":["comment"]
                }
              ]
            },
            {
              "size":"4",
              "html":[
                {
                  "element":"p",
                  "content":"€ [[total|money]]",
                  "css":{
                    "text-decoration":"line-through",
                    "color":"#777777"
                  },
                  "if":["discount"]
                },
                {
                  "content":"€ ",
                  "css":{"color":"#777777"},
                  "if":["discount","!discountPercent"]
                },
                {
                  "content":"[[discountValue|money]]",
                  "css":{"color":"#777777"},
                  "if":["discount","!discountPercent"]
                },
                {
                  "content":"[[discountValue]]",
                  "css":{"color":"#777777"},
                  "if":["discount","discountPercent"]
                },
                {
                  "content":"%",
                  "css":{"color":"#777777"},
                  "if":["discount","discountPercent"]
                },
                {
                  "content":" korting",
                  "css":{"color":"#777777"},
                  "if":["discount"]
                },
                {
                  "element":"p",
                  "content":"€ [[total|money]]"
                }
              ],
              "css":{
                "text-align":"right"
              }
            }
          ],
          "htmlBefore":"",
          "htmlAfter":"",
          "forEach":"receipt.details",
          "css":{
            "padding":[0,0,5,0]
          },
          "section":"products"
        },
        {
          "row":[
            {
              "size":"12",
              "html":"<hr/>"
            }
          ],
          "section":"payment"
        },
        {
          "row":[
            {
              "size":"6",
              "html":[
                {
                  "element":"h2",
                  "content":"Totaal"
                }
              ]
            },
            {
              "size":"6",
              "html":[
                {
                  "element":"h2",
                  "content":"€ [[receipt.transactionTotal|money]]",
                  "css":{
                    "text-align":"right"
                  }
                }
              ]
            }
          ],
          "css":{
            "padding":[2,0,0,0],
            "flex":"1"
          },
          "section":"payment"
        },
        {
          "row":[
            {
              "size":"6",
              "element":"table",
              "htmlBefore":"<tr><th>Betalingen:</th><th></th></tr>",
              "forEach":"receipt.receipt.payments",
              "html":"<tr><td>[[method]]</td><td>[[amount|money]]</td></tr>"
            },
            {
              "size":"6"
            }
          ],
          "css":{
            "padding":[3,0,0,0]
          },
          "section":"payment"
        },
        {
          "row":[
            {
              "size":"12",
              "html":"<small><table><tr><td></td><td>Ex. BTW</td><td>BTW</td><td>Totaal</td></tr><tr><td>0% BTW</td><td>€ 75,00</td><td>€ 0,00</td><td>€ 75,00</td></tr></table></small>"
            }
          ],
          "css":{
            "padding":[3,0,0,0]
          },
          "section":"payment"
        },
        {
          "row":[
            {
              "size":"12",
              "html":"Spaarpunten<br/>Punten nu verdiend: 7<br/>Saldo: 12"
            }
          ],
          "css":{
            "padding":[3,0,0,0]
          }
        },
        {
          "row":[
            {
              "size":"12",
              "html":"Ruilen binnen 8 dagen op vertoon van deze bon.<br/>Dank voor uw bezoek."
            }
          ],
          "css":{
            "padding":[3,0,0,0]
          }
        }
      ]
    }
    const dataString = {
      "receipt":{
        "concept" : false,
        "createdBy" : {
          "name" : "Niek"
        },
        "customer" : "5c2f276e86a7527e67a45e9d",
        "dateCreated" : "2020-06-23T14:43:04.015Z",
        "dateLastModified" : "2020-06-23T14:43:04.008Z",
        "details" : [
          {
            "quantity" : 1,
            "originalQuantity" : 1,
            "recievedQuantity" : 0,
            "price" : 12.396694214876,
            "total" : 14.99,
            "originalTotal" : 14.99,
            "priceVat" : 21,
            "refundAmount" : 0,
            "isNewProduct" : false,
            "stockUpQuantity" : 0,
            "margin" : 0,
            "entryMethodCustomerValue" : true,
            "storageFactor" : 0,
            "photos" : [],
            "name" : "Waterdicht maken 1, 5% korting",
            "discount" : true,
            "discountPercent" : true,
            "discountValue" : 5.00,
            "productNumber" : "000025629",
            "purchasePrice" : 0,
            "comment" : null,
            "type" : "product"
          },
          {
            "quantity" : 1,
            "originalQuantity" : 1,
            "recievedQuantity" : 0,
            "price" : 12.396694214876,
            "total" : 40,
            "originalTotal" : 50,
            "priceVat" : 21,
            "refundAmount" : 0,
            "isNewProduct" : false,
            "stockUpQuantity" : 0,
            "margin" : 0,
            "entryMethodCustomerValue" : true,
            "storageFactor" : 0,
            "photos" : [],
            "name" : "Waterdicht maken 2, 10 euro korting",
            "discount" : true,
            "discountPercent" : false,
            "discountValue" : 10.50,
            "productNumber" : "000025629",
            "purchasePrice" : 0,
            "comment" : null,
            "type" : "product"
          },
          {
            "quantity" : 1,
            "originalQuantity" : 1,
            "recievedQuantity" : 0,
            "price" : 12.396694214876,
            "total" : 40,
            "originalTotal" : 50,
            "priceVat" : 21,
            "refundAmount" : 0,
            "isNewProduct" : false,
            "stockUpQuantity" : 0,
            "margin" : 0,
            "entryMethodCustomerValue" : true,
            "storageFactor" : 0,
            "photos" : [],
            "name" : "Waterdicht maken 2, 10 euro korting",
            "discount" : true,
            "discountPercent" : false,
            "discountValue" : 10.50,
            "productNumber" : "000025629",
            "purchasePrice" : 0,
            "comment" : null,
            "type" : "product"
          },
          {
            "quantity" : 1,
            "originalQuantity" : 1,
            "recievedQuantity" : 0,
            "price" : 12.396694214876,
            "total" : 40,
            "originalTotal" : 50,
            "priceVat" : 21,
            "refundAmount" : 0,
            "isNewProduct" : false,
            "stockUpQuantity" : 0,
            "margin" : 0,
            "entryMethodCustomerValue" : true,
            "storageFactor" : 0,
            "photos" : [],
            "name" : "Waterdicht maken 2, 10 euro korting",
            "discount" : true,
            "discountPercent" : false,
            "discountValue" : 10.50,
            "productNumber" : "000025629",
            "purchasePrice" : 0,
            "comment" : null,
            "type" : "product"
          }

        ],
        "giftCardReedemAmount" : 0,
        "isCompanyRepliedAfterProcessingMode" : false,
        "isFeedBackRequiredFromCompany" : false,
        "isPurchaseOrderAttached" : false,
        "isShippingCoastRefunded" : false,
        "language" : "nl",
        "log" : [
          {
            "date" : "2020-06-23T14:43:04.136Z",
            "refundAmount" : 0,
            "user" : "5c1280589ea44a2665da0022",
            "text" : "Service Created",
            "isFor" : "retailerPortal",
            "eType" : "retailer"
          }
        ],
        "number" : "2357-230620-1643",
        "oldTill" : false,
        "parentTransactionId" : null,
        "receipt" : {
          "payments" : [
            {
              "amount" : 15,
              "giftcardNumber" : null,
              "change" : 0,
              "method" : "online_payment",
              "cardName" : null,
              "deposit" : false,
              "paymentHash" : null
            },
            {
              "amount" : 30,
              "giftcardNumber" : null,
              "change" : 0,
              "method" : "cash",
              "cardName" : null,
              "deposit" : false,
              "paymentHash" : null
            },
            {
              "amount" : 60,
              "giftcardNumber" : null,
              "change" : 0,
              "method" : "visa",
              "cardName" : null,
              "deposit" : false,
              "paymentHash" : null
            }
          ],
          "number" : "100798"
        },
        "refundedShippingCoast" : 0,
        "shopId" : "5891faa4e7c53e1a289d0069",
        "special" : {
          "externalPrice" : 0
        },
        "status" : "new",
        "statusHistory" : [],
        "totalEarning" : 0,
        "totalRefundAmount":0,
        "transactionTotal":15,
        "type" : "shop-purchase",
        "usedCouponCode" : "",
        "webshopTransactionComment" : "",
        "webshopURL" : ""
      },
      "shop":{
        "name" : "Juwelier Bos (FICTIEVE JUWELIER)",
        "description" : "Juwelier Bos is een demo website van het PrismaNote ontwikkel team. Geen echte juwelier dus!",
        "email" : "niek@prismanote.com",
        "website" : "www.juwelierbos.nl",
        "phone" : {
          "countryCode" : "NL",
          "mobilePhone" : "+31654921076",
          "landLine" : "+31345631776"
        },
        "address" : {
          "attn" : {
            "lastName" : "Bos",
            "firstName" : "J."
          },
          "country" : "NL",
          "city" : "Schiermonnikoog",
          "postalCode" : "9166SH",
          "houseNumberSuffix" : null,
          "houseNumber" : "33",
          "street" : "Prins Bernhardweg"
        },
        "isPremium" : true,
        "proShopUrl" : "http://www.juwelierbos.nl",
        "products" : [

        ],
        "sendProducts" : true,
        "showAllProducts" : true,
        "kvkNumber" : "",
        "btwNumber" : "",
        "nameSlug" : "juwelier-bos",
        "geoloc" : {
          "type" : "Point",
          "coordinates" : [
            53.4960157,
            6.1858988
          ]
        },
        "openingHours" : {
          "monday" : [
            "00:00",
            "00:00"
          ],
          "tuesday" : [
            "00:00",
            "00:00"
          ],
          "wednesday" : [
            "00:00",
            "00:00"
          ],
          "thursday" : [
            "00:00",
            "00:00"
          ],
          "friday" : [
            "00:00",
            "00:00"
          ],
          "saturday" : [
            "00:00",
            "00:00"
          ],
          "sunday" : [
            "00:00",
            "00:00"
          ]
        },
        "logoLight" : {
          "src" : "logos/logo-dark-juwelierbos.png"
        },
        "logoDark" : {
          "src" : "logos/logo-dark-juwelierbos.png"
        },
        "header" : {
          "topbar" : false,
          "searchbar" : true,
          "overlay" : true,
          "container" : false
        },
        "whatsappEnabled" : true,
        "shippingCosts" : 8.6,
        "isWebshop" : false,
        "searchBarVisible" : true,
        "userLimit" : "100",
        "socialMediaSupport" : false,
        "proShop" : false,
        "emailMarketingPremium" : false,
        "printLabels" : false,
        "socialMediaTool" : true,
        "countrIntegration" : false,
        "webshopActive" : true,
        "lastAddedArticleNumber" : "000025654",
        "articleNumberStart" : "000000001",
        "financial" : {
          "invoiceNumber" : "100798",
          "orderNumber" : "300000"
        },
        "domainDetails" : [
          {
            "websiteName" : "fictieve-juwelier",
            "domain" : "www.juwelierbos.nl"
          },
          {
            "websiteName" : "watch-my-jewel",
            "domain" : "www.watchmyjewel.com"
          }
        ],
        "employees" : [
          {
            "rights" : [],
            "email" : "marketing@prisma.watch",
            "firstName" : "Pieter",
            "lastName" : "Medewerker",
            "phone" : "[object Object]",
            "initials" : "PDM",
            "pincode" : 123,
            "enabled" : false
          }
        ],
        "isEmployeeLoginEnable" : true,
        "isShopActive" : true,
        "isVerified" : true,
        "identity" : {
          "email" : {
            "backgroundColor" : "rgb(245, 245, 245)",
            "accentColor" : "rgb(74, 182, 156)"
          }
        },
        "isFirstPurchaseOrder" : {
          "isCreatedFirstOrder" : true,
          "isFirstStatusIntoCompleted" : true,
          "isFirstStatusIntoInspection" : true
        },
        "private" : false,
        "type" : "physicalstore",
        "valuationProfitMethod" : "AvaragePurchasePrice",
        "dayClosure" : "day",
        "lastAccessed" : {
          "isActive" : true
        },
        "points" : {
          "discountPerPoint" : 0.1,
          "enabled" : true,
          "endDate" : null,
          "noEndDate" : true,
          "perEuro" : 0.1,
          "perEuro1" : 10,
          "perEuro2" : 1,
          "perPoint1" : 10,
          "perPoint2" : 1,
          "validity" : {
            "entity" : "year"
          }
        },
        "employeeLockTime" : 1,
        "startingDigits" : "BOS",
        "isAlreadyWebsiteCreated" : true,
        "goldStock" : 5,
        "goldStockValue" : 687.989,
        "pageFormats" : [
          {
            "autoPrint" : true,
            "name" : "TRANSACTION",
            "format" : "A4",
            "margins" : {
              "top" : 50,
              "bottom" : 50,
              "left" : 50,
              "right" : 50
            },
            "rotation" : 90,
            "shopInfo" : true,
            "combine" : true,
            "vertical" : false,
            "printerName" : "\\\\PC-DINIE\\HP LaserJet 1018",
            "paperTray" : "Auto Select"
          },
          {
            "autoPrint" : false,
            "name" : "REPAIR/SPECIAL",
            "format" : "A4",
            "margins" : {
              "top" : 20,
              "bottom" : 20,
              "left" : 20,
              "right" : 20
            },
            "rotation" : 0,
            "shopInfo" : true,
            "combine" : false
          },
          {
            "autoPrint" : false,
            "name" : "WEBSHOP",
            "format" : "A4",
            "margins" : {
              "top" : 20,
              "bottom" : 20,
              "left" : 20,
              "right" : 20
            },
            "rotation" : 0,
            "shopInfo" : true,
            "combine" : false
          },
          {
            "autoPrint" : false,
            "name" : "GIFTCARD",
            "format" : "A5",
            "margins" : {
              "top" : 0,
              "bottom" : 0,
              "left" : 0,
              "right" : 0
            },
            "rotation" : 90,
            "shopInfo" : false,
            "combine" : false,
            "extraMargins" : {
              "textLeft" : 401,
              "textTop" : 50,
              "valueLeft" : 415,
              "valueTop" : 70,
              "dateLeft" : 408,
              "dateTop" : 275,
              "barcodeLeft" : 375,
              "barcodeTop" : 400,
              "infoLeft" : 10,
              "infoTop" : 300,
              "infoWidth" : 200,
              "extraTextLeft" : 275,
              "extraTextTop" : 125
            }
          },
          {
            "autoPrint" : false,
            "name" : "DAYSTATE",
            "format" : "A4",
            "margins" : {
              "top" : 20,
              "bottom" : 20,
              "left" : 20,
              "right" : 20
            },
            "rotation" : 0,
            "shopInfo" : true,
            "combine" : false
          },
          {
            "autoPrint" : false,
            "name" : "PURCHASE_ORDER",
            "format" : "A4",
            "margins" : {
              "top" : 20,
              "bottom" : 20,
              "left" : 20,
              "right" : 20
            },
            "rotation" : 0,
            "shopInfo" : true,
            "combine" : false
          },
          {
            "autoPrint" : false,
            "name" : "OFFER",
            "format" : "A4",
            "margins" : {
              "top" : 20,
              "bottom" : 20,
              "left" : 20,
              "right" : 20
            },
            "rotation" : 0,
            "shopInfo" : true,
            "combine" : false
          }
        ],
        "accountHolder" : "TEST",
        "bankAccountNumber" : "DK9520000123456789",
        "pvc" : "123",
        "vatNumber" : "123",
        "hideOldCashRegister" : false,
        "isDeleted" : false,
        "newLabel" : true,
        "labelPrinter" : "ZDesigner ZD420-203dpi ZPL",
        "shippingOptions" : [
          {
            "type" : "Pick-upInStore",
            "domestic" : 0,
            "abroad" : 0
          }
        ],
        "abroadShippingCosts" : 0,
        "freeShippingCostsAbroad" : 0,
        "freeShippingCostsDomastic" : 0,
        "shippingCostsDomastic" : 0,
        "webshop" : {
          "paymentProvider" : "pay",
          "mollieApiKey" : ""
        }
      }
    }

    this.templateString = templateString
    this.dataString = dataString
  }


  generatePDF(): void {
    this.pdfGenerating = true
    this.pdfService.createPdf(JSON.stringify(this.templateString), JSON.stringify(this.dataString),new Date().getTime().toString())
      .then( () => {
        this.pdfGenerating = false
      })
      .catch( (e) => {
        this.pdfGenerating = false
        console.error('err', e)
      })
  }

}
