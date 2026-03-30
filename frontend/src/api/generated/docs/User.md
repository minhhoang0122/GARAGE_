# User


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**username** | **string** |  | [optional] [default to undefined]
**fullName** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**isActive** | **boolean** |  | [optional] [default to undefined]
**specialty** | **string** |  | [optional] [default to undefined]
**level** | **string** |  | [optional] [default to undefined]
**avatar** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**userType** | **string** |  | [optional] [default to undefined]
**roles** | [**Set&lt;Role&gt;**](Role.md) |  | [optional] [default to undefined]
**active** | **boolean** |  | [optional] [default to undefined]
**admin** | **boolean** |  | [optional] [default to undefined]
**manager** | **boolean** |  | [optional] [default to undefined]
**allPermissions** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**authorities** | [**Array&lt;GrantedAuthority&gt;**](GrantedAuthority.md) |  | [optional] [default to undefined]

## Example

```typescript
import { User } from './api';

const instance: User = {
    id,
    username,
    fullName,
    phone,
    email,
    isActive,
    specialty,
    level,
    avatar,
    createdAt,
    userType,
    roles,
    active,
    admin,
    manager,
    allPermissions,
    authorities,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
