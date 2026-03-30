# PaymentControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getOrdersWaitingPayment**](#getorderswaitingpayment) | **GET** /api/payment/pending | |
|[**getPaymentSummary**](#getpaymentsummary) | **GET** /api/payment/{orderId} | |
|[**processPayment**](#processpayment) | **POST** /api/payment/{orderId}/process | |

# **getOrdersWaitingPayment**
> object getOrdersWaitingPayment()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

const { status, data } = await apiInstance.getOrdersWaitingPayment();
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

# **getPaymentSummary**
> object getPaymentSummary()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.getPaymentSummary(
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

# **processPayment**
> object processPayment(requestBody)


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let orderId: number; // (default to undefined)
let requestBody: { [key: string]: object; }; //

const { status, data } = await apiInstance.processPayment(
    orderId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: object; }**|  | |
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

