# ReportControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAdminDashboardStats**](#getadmindashboardstats) | **GET** /api/reports/dashboard-stats | |
|[**getInventoryReport**](#getinventoryreport) | **GET** /api/reports/inventory | |
|[**getMechanicPerformance**](#getmechanicperformance) | **GET** /api/reports/mechanic-performance | |
|[**getRevenueReport**](#getrevenuereport) | **GET** /api/reports/revenue | |

# **getAdminDashboardStats**
> object getAdminDashboardStats()


### Example

```typescript
import {
    ReportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportControllerApi(configuration);

const { status, data } = await apiInstance.getAdminDashboardStats();
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

# **getInventoryReport**
> object getInventoryReport()


### Example

```typescript
import {
    ReportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportControllerApi(configuration);

const { status, data } = await apiInstance.getInventoryReport();
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

# **getMechanicPerformance**
> object getMechanicPerformance()


### Example

```typescript
import {
    ReportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportControllerApi(configuration);

let from: string; // (default to undefined)
let to: string; // (default to undefined)

const { status, data } = await apiInstance.getMechanicPerformance(
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] |  | defaults to undefined|
| **to** | [**string**] |  | defaults to undefined|


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

# **getRevenueReport**
> object getRevenueReport()


### Example

```typescript
import {
    ReportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportControllerApi(configuration);

let from: string; // (default to undefined)
let to: string; // (default to undefined)

const { status, data } = await apiInstance.getRevenueReport(
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] |  | defaults to undefined|
| **to** | [**string**] |  | defaults to undefined|


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

