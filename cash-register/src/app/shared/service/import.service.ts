import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * General API Service to send all requests to the server. An HTTP interceptor will encrypt the request when needed
 */
export class ImportService {

    processImportCustomer(data: any) {
        const { customer } = data;

        const processCustomer = {
            sSalutation: customer?.['Salutation'] ? customer['Salutation'] : "do-nothing",
            sFirstName: customer?.['Firstname'] ? customer['Firstname'] : "do-nothing",
            sPrefix: customer?.['Prefix'] ? customer['Prefix'] : "do-nothing",
            sLastName: customer?.['Surname'] ? customer['Surname'] : "do-nothing",
            sGender: customer?.['Gender'] ? customer['Gender'] : "do-nothing",
            sEmail: customer?.['Email'] ? customer['Email'] : "do-nothing",

            oPhone: {
                sMobile: customer?.['Phone mobile'] ? customer['Phone mobile'] : "do-nothing",
                sLandLine: customer?.['Phone landline'] ? customer['Phone landline'] : "do-nothing",
            },

            oShippingAddress: {
                attn: {
                    sSalutation: customer?.['Salutation'] ? customer['Salutation'] : "do-nothing",
                    sFirstName: customer?.['Firstname'] ? customer['Firstname'] : "do-nothing",
                    sLastName: customer?.['Surname'] ? customer['Surname'] : "do-nothing",
                },
                sStreet: customer?.['Street'] ? customer['Street'] : "do-nothing",
                sHouseNumber: customer?.['House number'] ? customer['House number'] : "do-nothing",
                sHouseNumberSuffix: customer?.['House number addition'] ? customer['House number addition'] : "do-nothing",
                sPostalCode: customer?.['Zip code'] ? customer['Zip code'] : "do-nothing",
                sCity: customer?.['City'] ? customer['City'] : "do-nothing",
                sCountry: customer?.['Country'] ? customer['Country'] : "do-nothing",
            },

            sComment: customer?.['Comment'] ? customer['Comment'] : "do-nothing",
            nMatchingCode: customer?.['Customer number'] ? customer['Customer number'] : "do-nothing",
            bNewsletter: customer?.['Newsletter'] ? customer['Newsletter'] : "do-nothing"
        }

        return processCustomer;
    }

    processImportProduct(data: any) {
        const { product } = data;
        const processProduct = {
            nPriceIncludesVat: product?.['priceIncVat'] ? product['priceIncVat'] : "do-nothing",
            nMinStock: product?.['minStock'] ? product['minStock'] : "do-nothing",
            oName: product?.['en name'] ? product['en name'] : "do-nothing",
            bShowSuggestion: product?.['showSuggestion'] ? product['showSuggestion'] : "do-nothing",
            bEntryMethodCustomerValue: product?.['entrymethodcustomervalue'] ? product['entrymethodcustomervalue'] : "do-nothing",
            sProductNumber: product?.['productNumber'] ? product['productNumber'] : "do-nothing",
            iBusinessBrandId: product?.['brand_name'] ? product['brand_name'] : "do-nothing",
            iSupplier: product?.['supplier_name'] ? product['supplier_name'] : "do-nothing",
            sEan: product?.['ean'] ? product['ean'] : "do-nothing",
            nVatRate: product?.['priceVat'] ? product['priceVat'] : "do-nothing",
            nDiscount: product?.['discount'] ? product['discount'] : "do-nothing",
            bBestseller: product?.['bestseller'] ? product['bestseller'] : "do-nothing",
            aImage: product?.['image'] ? product['image'] : "do-nothing",
            bDiscountOnPercentage: product?.['discountOnPercentage'] ? product['discountOnPercentage'] : "do-nothing",
            eOwnerShip: product?.['ownership'] ? product['ownership'] : "do-nothing",
            sLabelDescription: product?.['labelDescription'] ? product['labelDescription'] : "do-nothing",
            nSortingNumber: product?.['sortingNumber'] ? product['sortingNumber'] : "do-nothing",
            eGender: product?.['gender'] ? product['gender'] : "do-nothing",
            oNameSlug: product?.['en nameslug'] ? product['en nameslug'] : "do-nothing",
            nPurchasePrice: product?.['purchasePrice'] ? product['purchasePrice'] : "do-nothing",
            nSupplierSuggestedRetailPrice: product?.['nSupplierSuggestedRetailPrice'] ? product['nSupplierSuggestedRetailPrice'] : "do-nothing",
            nSuggestedRetailPrice: product?.['nSuggestedRetailPrice'] ? product['nSuggestedRetailPrice'] : "do-nothing",
            bHasStock: product?.['hasStock'] ? product['hasStock'] : "do-nothing"
        }

        return processProduct;
    }

    processConnectProductData(oData: any) {
        const { aBusinessProducts, aConnectProducts } = oData;

        const oPocessObject = {
            aBusinessProducts: aBusinessProducts.map((businessProduct: any) => {
                return {
                    iBusinessProductId: businessProduct.iBusinessProductId,
                    sArticleNumber: businessProduct.article,
                    oBusinessBrand: businessProduct.oBusinessBrand,
                    sProductNumber: businessProduct.productNumber,
                    selected: false,
                    status: 0, // status is used to check that productNumber is valid or not
                    isInvalid: false
                }
            }),
            aConnectProducts: aConnectProducts.map((connectProduct: any) => {
                return connectProduct;
            }),
        }

        return oPocessObject;
    }
}