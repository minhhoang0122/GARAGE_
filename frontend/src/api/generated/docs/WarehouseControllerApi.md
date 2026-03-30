# WarehouseControllerApi

All URIs are relative to *http://localhost:8081*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveImport**](#approveimport) | **POST** /api/warehouse/import/{id}/approve | |
|[**createReservation**](#createreservation) | **POST** /api/warehouse/reserve/{orderId} | |
|[**disposeBatch**](#disposebatch) | **POST** /api/warehouse/inventory/batch/{batchId}/dispose | |
|[**exportOrder**](#exportorder) | **POST** /api/warehouse/export/{orderId} | |
|[**getExportHistory**](#getexporthistory) | **GET** /api/warehouse/history/export | |
|[**getImportDetail**](#getimportdetail) | **GET** /api/warehouse/import/{id} | |
|[**getImportHistory**](#getimporthistory) | **GET** /api/warehouse/history/import | |
|[**getImports**](#getimports) | **GET** /api/warehouse/imports | |
|[**getOrderExportDetails**](#getorderexportdetails) | **GET** /api/warehouse/export/{id} | |
|[**getPendingExportOrders**](#getpendingexportorders) | **GET** /api/warehouse/pending | |
|[**getProductBatches**](#getproductbatches) | **GET** /api/warehouse/inventory/{productId}/batches | |
|[**getProductDetail**](#getproductdetail) | **GET** /api/warehouse/inventory/product/{id} | |
|[**getProductMovements**](#getproductmovements) | **GET** /api/warehouse/inventory/{productId}/movements | |
|[**getProducts**](#getproducts) | **GET** /api/warehouse/products | |
|[**getWarehouseStats**](#getwarehousestats) | **GET** /api/warehouse/stats | |
|[**importStock**](#importstock) | **POST** /api/warehouse/import | |
|[**rejectImport**](#rejectimport) | **POST** /api/warehouse/import/{id}/reject | |
|[**releaseReservation**](#releasereservation) | **POST** /api/warehouse/release/{orderId} | |

# **approveImport**
> object approveImport()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.approveImport(
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

# **createReservation**
> object createReservation()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.createReservation(
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

# **disposeBatch**
> object disposeBatch()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let batchId: number; // (default to undefined)

const { status, data } = await apiInstance.disposeBatch(
    batchId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **batchId** | [**number**] |  | defaults to undefined|


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

# **exportOrder**
> object exportOrder()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let orderId: number; // (default to undefined)

const { status, data } = await apiInstance.exportOrder(
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

# **getExportHistory**
> object getExportHistory()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

const { status, data } = await apiInstance.getExportHistory();
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

# **getImportDetail**
> object getImportDetail()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getImportDetail(
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

# **getImportHistory**
> object getImportHistory()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

const { status, data } = await apiInstance.getImportHistory();
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

# **getImports**
> object getImports()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let status: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getImports(
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

# **getOrderExportDetails**
> object getOrderExportDetails()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getOrderExportDetails(
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

# **getPendingExportOrders**
> object getPendingExportOrders()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

const { status, data } = await apiInstance.getPendingExportOrders();
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

# **getProductBatches**
> object getProductBatches()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let productId: number; // (default to undefined)

const { status, data } = await apiInstance.getProductBatches(
    productId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **productId** | [**number**] |  | defaults to undefined|


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

# **getProductDetail**
> object getProductDetail()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getProductDetail(
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

# **getProductMovements**
> object getProductMovements()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let productId: number; // (default to undefined)

const { status, data } = await apiInstance.getProductMovements(
    productId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **productId** | [**number**] |  | defaults to undefined|


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

# **getProducts**
> object getProducts()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getProducts(
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

# **getWarehouseStats**
> object getWarehouseStats()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

const { status, data } = await apiInstance.getWarehouseStats();
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

# **importStock**
> object importStock(importRequestDTO)


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration,
    ImportRequestDTO
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let importRequestDTO: ImportRequestDTO; //

const { status, data } = await apiInstance.importStock(
    importRequestDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **importRequestDTO** | **ImportRequestDTO**|  | |


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

# **rejectImport**
> object rejectImport()


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.rejectImport(
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

# **releaseReservation**
> object releaseReservation(requestBody)


### Example

```typescript
import {
    WarehouseControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new WarehouseControllerApi(configuration);

let orderId: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.releaseReservation(
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

