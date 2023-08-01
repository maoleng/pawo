import { near } from 'near-sdk-js';

export function executeWithReset(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        this.resetProperty();
        return originalMethod.apply(this, args);
    };

    return descriptor;
}

export function responseData(data): string
{
    return JSON.stringify({
        status: true,
        data: data,
    });
}

export function responseMessage(status, message): string
{
    return JSON.stringify({
        status: status,
        message: message,
    });
}

export function updateObject(originalObject, newObject) {
    for (const key in newObject) {
        if (newObject.hasOwnProperty(key)) {
            originalObject[key] = newObject[key];
        }
    }
}

export function now(): Date
{
    return new Date(Number(near.blockTimestamp()) / 1000000);
}