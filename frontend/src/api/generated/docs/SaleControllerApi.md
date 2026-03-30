# SaleControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addItem**](#additem) | **POST** /api/sale/orders/{id}/items | |
|[**cancelOrder**](#cancelorder) | **POST** /api/sale/orders/{id}/cancel | |
|[**claimOrder**](#claimorder) | **POST** /api/sale/orders/{id}/claim | |
|[**closeOrder**](#closeorder) | **POST** /api/sale/orders/{id}/close | |
|[**createCustomer**](#createcustomer) | **POST** /api/sale/customers | |
|[**createOrder**](#createorder) | **POST** /api/sale/orders | |
|[**createWarranty**](#createwarranty) | **POST** /api/sale/orders/{id}/warranty | |
|[**finalizeOrder**](#finalizeorder) | **POST** /api/sale/orders/{id}/finalize | |
|[**getAllBookings**](#getallbookings) | **GET** /api/sale/bookings | |
|[**getAllWarranties**](#getallwarranties) | **GET** /api/sale/warranties | |
|[**getCustomerById**](#getcustomerbyid) | **GET** /api/sale/customers/{id} | |
|[**getCustomers**](#getcustomers) | **GET** /api/sale/customers | |
|[**getDashboardStats**](#getdashboardstats) | **GET** /api/sale/stats | |
|[**getOrderDetails**](#getorderdetails) | **GET** /api/sale/orders/{id} | |
|[**getOrders**](#getorders) | **GET** /api/sale/orders | |
|[**removeItem**](#removeitem) | **DELETE** /api/sale/items/{id} | |
|[**rescheduleBooking**](#reschedulebooking) | **PATCH** /api/sale/bookings/{id}/reschedule | |
|[**searchProducts**](#searchproducts) | **GET** /api/sale/products | |
|[**submitReplenishment**](#submitreplenishment) | **POST** /api/sale/orders/{id}/submit-replenishment | |
|[**submitToCustomer**](#submittocustomer) | **POST** /api/sale/orders/{id}/submit | |
|[**updateBooking**](#updatebooking) | **PUT** /api/sale/bookings/{id} | |
|[**updateCustomer**](#updatecustomer) | **PATCH** /api/sale/customers/{id} | |
|[**updateDeposit**](#updatedeposit) | **POST** /api/sale/orders/{id}/deposit | |
|[**updateItem**](#updateitem) | **PATCH** /api/sale/items/{id} | |
|[**updateItemStatus**](#updateitemstatus) | **PATCH** /api/sale/items/{id}/status | |
|[**updateOrderTotals**](#updateordertotals) | **PATCH** /api/sale/orders/{id}/totals | |

# **addItem**
> object addItem(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.addItem(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cancelOrder**
> object cancelOrder(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.cancelOrder(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **claimOrder**
> object claimOrder()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.claimOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **closeOrder**
> object closeOrder()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.closeOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createCustomer**
> object createCustomer(customer)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration,
    Customer
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let customer: Customer; //

const { status, data } = await apiInstance.createCustomer(
    customer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customer** | **Customer**|  | |


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createOrder**
> object createOrder(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.createOrder(
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createWarranty**
> object createWarranty(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.createWarranty(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **finalizeOrder**
> object finalizeOrder()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.finalizeOrder(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllBookings**
> Array<{ [key: string]: object; }> getAllBookings()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

const { status, data } = await apiInstance.getAllBookings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<{ [key: string]: object; }>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllWarranties**
> Array<{ [key: string]: object; }> getAllWarranties()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

const { status, data } = await apiInstance.getAllWarranties();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<{ [key: string]: object; }>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomerById**
> object getCustomerById()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getCustomerById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomers**
> object getCustomers()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getCustomers(
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDashboardStats**
> object getDashboardStats()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

const { status, data } = await apiInstance.getDashboardStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrderDetails**
> OrderDetailDTO getOrderDetails()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getOrderDetails(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**OrderDetailDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrders**
> object getOrders()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let status: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getOrders(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | (optional) defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeItem**
> object removeItem()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.removeItem(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rescheduleBooking**
> object rescheduleBooking(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.rescheduleBooking(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchProducts**
> Array<ProductDTO> searchProducts()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.searchProducts(
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ProductDTO>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitReplenishment**
> object submitReplenishment()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.submitReplenishment(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitToCustomer**
> object submitToCustomer()


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.submitToCustomer(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBooking**
> object updateBooking(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.updateBooking(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCustomer**
> object updateCustomer(customer)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration,
    Customer
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let customer: Customer; //

const { status, data } = await apiInstance.updateCustomer(
    id,
    customer
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customer** | **Customer**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDeposit**
> object updateDeposit(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.updateDeposit(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateItem**
> object updateItem(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.updateItem(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateItemStatus**
> object updateItemStatus(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.updateItemStatus(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateOrderTotals**
> object updateOrderTotals(requestBody)


### Example

```typescript
import {
    SaleControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SaleControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.updateOrderTotals(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

