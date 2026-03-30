# MechanicControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminAssignItem**](#adminassignitem) | **POST** /api/mechanic/items/{itemId}/assign-direct | |
|[**adminUnassignItem**](#adminunassignitem) | **DELETE** /api/mechanic/items/assign-direct/{taskId} | |
|[**approveJoinTask**](#approvejointask) | **POST** /api/mechanic/assignments/{id}/approve | |
|[**assignJob**](#assignjob) | **POST** /api/mechanic/jobs/{id}/assign | |
|[**claimJob**](#claimjob) | **POST** /api/mechanic/jobs/{id}/claim | |
|[**completeJob**](#completejob) | **POST** /api/mechanic/jobs/{id}/complete | |
|[**confirmTechnicalIssue**](#confirmtechnicalissue) | **POST** /api/mechanic/jobs/{id}/confirm-technical | |
|[**getAssignedJobs**](#getassignedjobs) | **GET** /api/mechanic/jobs | |
|[**getAvailableMechanics**](#getavailablemechanics) | **GET** /api/mechanic/mechanics | |
|[**getDashboardStats1**](#getdashboardstats1) | **GET** /api/mechanic/stats | |
|[**getInspectedHistory**](#getinspectedhistory) | **GET** /api/mechanic/inspect/history | |
|[**getJobDetails**](#getjobdetails) | **GET** /api/mechanic/jobs/{id} | |
|[**getOrdersForTechnicalReview**](#getordersfortechnicalreview) | **GET** /api/mechanic/technical-review | |
|[**getReceptionDetail**](#getreceptiondetail) | **GET** /api/mechanic/inspect/{id} | |
|[**getReceptionsToInspect**](#getreceptionstoinspect) | **GET** /api/mechanic/inspect | |
|[**getRepairHistory**](#getrepairhistory) | **GET** /api/mechanic/jobs/history | |
|[**getTopProducts**](#gettopproducts) | **GET** /api/mechanic/top-products | |
|[**qcFail**](#qcfail) | **POST** /api/mechanic/jobs/{id}/qc-fail | |
|[**qcPass**](#qcpass) | **POST** /api/mechanic/jobs/{id}/qc-pass | |
|[**removeProposedItem**](#removeproposeditem) | **DELETE** /api/mechanic/items/{itemId} | |
|[**reportIssue**](#reportissue) | **POST** /api/mechanic/jobs/{id}/report-issue | |
|[**requestJoinTask**](#requestjointask) | **POST** /api/mechanic/items/{itemId}/join | |
|[**searchProducts1**](#searchproducts1) | **GET** /api/mechanic/search-products | |
|[**submitAssignments**](#submitassignments) | **POST** /api/mechanic/jobs/{id}/submit-assignments | |
|[**submitProposal**](#submitproposal) | **POST** /api/mechanic/inspect/{id}/proposal | |
|[**toggleItemCompletion**](#toggleitemcompletion) | **POST** /api/mechanic/items/{itemId}/toggle | |
|[**unassignMechanic**](#unassignmechanic) | **DELETE** /api/mechanic/assignments/{assignmentId} | |
|[**unclaimJob**](#unclaimjob) | **POST** /api/mechanic/jobs/{id}/unclaim | |
|[**updateItemMaxMechanics**](#updateitemmaxmechanics) | **PUT** /api/mechanic/items/{itemId}/max-mechanics | |
|[**updateItemMaxMechanicsV2**](#updateitemmaxmechanicsv2) | **PUT** /api/mechanic/items/{itemId}/max-mechanics-v2 | |
|[**updateTaskDistribution**](#updatetaskdistribution) | **POST** /api/mechanic/items/{itemId}/distribution | |

# **adminAssignItem**
> object adminAssignItem()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)
let mechanicId: number; // (default to undefined)

const { status, data } = await apiInstance.adminAssignItem(
    itemId,
    mechanicId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|
| **mechanicId** | [**number**] |  | defaults to undefined|


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

# **adminUnassignItem**
> object adminUnassignItem()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let taskId: number; // (default to undefined)

const { status, data } = await apiInstance.adminUnassignItem(
    taskId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskId** | [**number**] |  | defaults to undefined|


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

# **approveJoinTask**
> object approveJoinTask()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.approveJoinTask(
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

# **assignJob**
> object assignJob()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)
let mechanicId: number; // (default to undefined)

const { status, data } = await apiInstance.assignJob(
    id,
    mechanicId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **mechanicId** | [**number**] |  | defaults to undefined|


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

# **claimJob**
> object claimJob()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.claimJob(
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

# **completeJob**
> object completeJob()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.completeJob(
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

# **confirmTechnicalIssue**
> object confirmTechnicalIssue(requestBody)


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)
let requestBody: Array<number>; //

const { status, data } = await apiInstance.confirmTechnicalIssue(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **Array<number>**|  | |
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

# **getAssignedJobs**
> object getAssignedJobs()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getAssignedJobs();
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

# **getAvailableMechanics**
> object getAvailableMechanics()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getAvailableMechanics();
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

# **getDashboardStats1**
> object getDashboardStats1()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getDashboardStats1();
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

# **getInspectedHistory**
> object getInspectedHistory()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getInspectedHistory();
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

# **getJobDetails**
> object getJobDetails()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getJobDetails(
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

# **getOrdersForTechnicalReview**
> object getOrdersForTechnicalReview()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getOrdersForTechnicalReview();
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

# **getReceptionDetail**
> object getReceptionDetail()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getReceptionDetail(
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

# **getReceptionsToInspect**
> object getReceptionsToInspect()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getReceptionsToInspect();
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

# **getRepairHistory**
> object getRepairHistory()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getRepairHistory();
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

# **getTopProducts**
> object getTopProducts()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

const { status, data } = await apiInstance.getTopProducts();
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

# **qcFail**
> object qcFail()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.qcFail(
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

# **qcPass**
> object qcPass()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.qcPass(
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

# **removeProposedItem**
> object removeProposedItem()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)

const { status, data } = await apiInstance.removeProposedItem(
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|


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

# **reportIssue**
> object reportIssue(proposalItemDTO)


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)
let proposalItemDTO: Array<ProposalItemDTO>; //

const { status, data } = await apiInstance.reportIssue(
    id,
    proposalItemDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **proposalItemDTO** | **Array<ProposalItemDTO>**|  | |
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

# **requestJoinTask**
> object requestJoinTask()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)

const { status, data } = await apiInstance.requestJoinTask(
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|


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

# **searchProducts1**
> object searchProducts1()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let query: string; // (default to undefined)

const { status, data } = await apiInstance.searchProducts1(
    query
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **query** | [**string**] |  | defaults to undefined|


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

# **submitAssignments**
> object submitAssignments()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.submitAssignments(
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

# **submitProposal**
> object submitProposal(proposalItemDTO)


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)
let proposalItemDTO: Array<ProposalItemDTO>; //

const { status, data } = await apiInstance.submitProposal(
    id,
    proposalItemDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **proposalItemDTO** | **Array<ProposalItemDTO>**|  | |
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

# **toggleItemCompletion**
> object toggleItemCompletion()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)

const { status, data } = await apiInstance.toggleItemCompletion(
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|


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

# **unassignMechanic**
> object unassignMechanic()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let assignmentId: number; // (default to undefined)

const { status, data } = await apiInstance.unassignMechanic(
    assignmentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignmentId** | [**number**] |  | defaults to undefined|


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

# **unclaimJob**
> object unclaimJob()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.unclaimJob(
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

# **updateItemMaxMechanics**
> object updateItemMaxMechanics()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)
let limit: number; // (default to undefined)

const { status, data } = await apiInstance.updateItemMaxMechanics(
    itemId,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|
| **limit** | [**number**] |  | defaults to undefined|


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

# **updateItemMaxMechanicsV2**
> object updateItemMaxMechanicsV2()


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)
let limit: number; // (default to undefined)

const { status, data } = await apiInstance.updateItemMaxMechanicsV2(
    itemId,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**number**] |  | defaults to undefined|
| **limit** | [**number**] |  | defaults to undefined|


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

# **updateTaskDistribution**
> object updateTaskDistribution(requestBody)


### Example

```typescript
import {
    MechanicControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MechanicControllerApi(configuration);

let itemId: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.updateTaskDistribution(
    itemId,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: number; }**|  | |
| **itemId** | [**number**] |  | defaults to undefined|


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

