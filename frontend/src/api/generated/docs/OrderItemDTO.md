# OrderItemDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**productId** | **number** |  | [optional] [default to undefined]
**productCode** | **string** |  | [optional] [default to undefined]
**productName** | **string** |  | [optional] [default to undefined]
**quantity** | **number** |  | [optional] [default to undefined]
**unitPrice** | **number** |  | [optional] [default to undefined]
**total** | **number** |  | [optional] [default to undefined]
**discountPercent** | **number** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**itemStatus** | **string** |  | [optional] [default to undefined]
**stock** | **number** |  | [optional] [default to undefined]
**proposedById** | **number** |  | [optional] [default to undefined]
**proposedByName** | **string** |  | [optional] [default to undefined]
**proposedByRole** | **string** |  | [optional] [default to undefined]
**isWarranty** | **boolean** |  | [optional] [default to undefined]
**isTechnicalAddition** | **boolean** |  | [optional] [default to undefined]
**proposedAt** | **string** |  | [optional] [default to undefined]
**assignments** | [**Array&lt;AssignmentDTO&gt;**](AssignmentDTO.md) |  | [optional] [default to undefined]
**version** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { OrderItemDTO } from './api';

const instance: OrderItemDTO = {
    id,
    productId,
    productCode,
    productName,
    quantity,
    unitPrice,
    total,
    discountPercent,
    type,
    itemStatus,
    stock,
    proposedById,
    proposedByName,
    proposedByRole,
    isWarranty,
    isTechnicalAddition,
    proposedAt,
    assignments,
    version,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
