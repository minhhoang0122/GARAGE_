# DebtControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDebtors**](#getdebtors) | **GET** /api/debts | |

# **getDebtors**
> Array<DebtDTO> getDebtors()


### Example

```typescript
import {
    DebtControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DebtControllerApi(configuration);

const { status, data } = await apiInstance.getDebtors();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<DebtDTO>**

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

