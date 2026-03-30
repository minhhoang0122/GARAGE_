# PublicBookingControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createBooking**](#createbooking) | **POST** /api/public/booking | |
|[**getPublicServices**](#getpublicservices) | **GET** /api/public/services | |

# **createBooking**
> object createBooking(publicBookingDTO)


### Example

```typescript
import {
    PublicBookingControllerApi,
    Configuration,
    PublicBookingDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicBookingControllerApi(configuration);

let publicBookingDTO: PublicBookingDTO; //

const { status, data } = await apiInstance.createBooking(
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

# **getPublicServices**
> Array<PublicProductDTO> getPublicServices()


### Example

```typescript
import {
    PublicBookingControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicBookingControllerApi(configuration);

const { status, data } = await apiInstance.getPublicServices();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<PublicProductDTO>**

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

