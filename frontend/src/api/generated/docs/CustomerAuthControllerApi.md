# CustomerAuthControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**register**](#register) | **POST** /api/public/customer/register | |
|[**verifyRegistration**](#verifyregistration) | **POST** /api/public/customer/verify-registration | |

# **register**
> object register(customerRegisterDTO)


### Example

```typescript
import {
    CustomerAuthControllerApi,
    Configuration,
    CustomerRegisterDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerAuthControllerApi(configuration);

let customerRegisterDTO: CustomerRegisterDTO; //

const { status, data } = await apiInstance.register(
    customerRegisterDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **customerRegisterDTO** | **CustomerRegisterDTO**|  | |


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

# **verifyRegistration**
> object verifyRegistration(verifyRegistrationDTO)


### Example

```typescript
import {
    CustomerAuthControllerApi,
    Configuration,
    VerifyRegistrationDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new CustomerAuthControllerApi(configuration);

let verifyRegistrationDTO: VerifyRegistrationDTO; //

const { status, data } = await apiInstance.verifyRegistration(
    verifyRegistrationDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyRegistrationDTO** | **VerifyRegistrationDTO**|  | |


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

