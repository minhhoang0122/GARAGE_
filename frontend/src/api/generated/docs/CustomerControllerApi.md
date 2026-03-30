# CustomerControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveQuote**](#approvequote) | **POST** /api/customer/orders/{orderId}/approve | |
|[**createBooking1**](#createbooking1) | **POST** /api/customer/booking | |
|[**getMyOrders**](#getmyorders) | **GET** /api/customer/orders | |
|[**getMyVehicles**](#getmyvehicles) | **GET** /api/customer/my-vehicles | |
|[**getOrderDetails1**](#getorderdetails1) | **GET** /api/customer/orders/{orderId} | |
|[**getQrPayment**](#getqrpayment) | **GET** /api/customer/qr-payment/{orderId} | |
|[**getWarrantyItems**](#getwarrantyitems) | **GET** /api/customer/warranty | |
|[**rejectQuote**](#rejectquote) | **POST** /api/customer/orders/{orderId}/reject | |
|[**requestRevision**](#requestrevision) | **POST** /api/customer/orders/{orderId}/request-revision | |
|[**submitWarrantyClaim**](#submitwarrantyclaim) | **POST** /api/customer/warranty-claim | |

# **approveQuote**
> object approveQuote()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.approveQuote(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**number**] |  | defaults to undefined|


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

# **createBooking1**
> object createBooking1(publicBookingDTO)


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration,
    PublicBookingDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let publicBookingDTO: PublicBookingDTO; //

const { status, data } = await apiInstance.createBooking1(
    publicBookingDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **publicBookingDTO** | **PublicBookingDTO**|  | |


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

# **getMyOrders**
> object getMyOrders()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

const { status, data } = await apiInstance.getMyOrders();
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

# **getMyVehicles**
> object getMyVehicles()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

const { status, data } = await apiInstance.getMyVehicles();
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

# **getOrderDetails1**
> object getOrderDetails1()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.getOrderDetails1(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**number**] |  | defaults to undefined|


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

# **getQrPayment**
> object getQrPayment()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.getQrPayment(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | [**number**] |  | defaults to undefined|


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

# **getWarrantyItems**
> object getWarrantyItems()


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

const { status, data } = await apiInstance.getWarrantyItems();
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

# **rejectQuote**
> object rejectQuote(requestBody)


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let orderId: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.rejectQuote(
    orderId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **orderId** | [**number**] |  | defaults to undefined|


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

# **requestRevision**
> object requestRevision(requestBody)


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let orderId: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.requestRevision(
    orderId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **orderId** | [**number**] |  | defaults to undefined|


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

# **submitWarrantyClaim**
> object submitWarrantyClaim(requestBody)


### Example

```typescript
import {
    CustomerControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerControllerApi(configuration);

let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.submitWarrantyClaim(
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

