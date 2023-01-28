/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./../context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  ListCreateInput: { // input type
    date?: NexusGenScalars['DateTime'] | null; // DateTime
    members: NexusGenInputs['ListMemberInput'][]; // [ListMemberInput!]!
    name: string; // String!
  }
  ListMemberInput: { // input type
    gender: NexusGenEnums['Gender']; // Gender!
    position: number; // Int!
  }
  UserCreateInput: { // input type
    email: string; // String!
    lists?: NexusGenInputs['ListCreateInput'][] | null; // [ListCreateInput!]
  }
  UserUniqueInput: { // input type
    email?: string | null; // String
    id?: number | null; // Int
  }
}

export interface NexusGenEnums {
  Gender: "divers" | "man" | "woman"
  ListStatus: "live" | "proposed" | "sandbox"
  SortOrder: "asc" | "desc"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
}

export interface NexusGenObjects {
  AuthPayload: { // root type
    token?: string | null; // String
    user?: NexusGenRootTypes['User'] | null; // User
  }
  List: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: string; // String!
    name: string; // String!
    ownerId: string; // String!
    status: NexusGenEnums['ListStatus']; // ListStatus!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  }
  ListMember: { // root type
    gender: NexusGenEnums['Gender']; // Gender!
    id: string; // String!
    listRevId: string; // String!
    position: number; // Int!
  }
  ListRevision: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: string; // String!
    members: NexusGenRootTypes['ListMember'][]; // [ListMember!]!
    ownerId: string; // String!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  }
  Mutation: {};
  Query: {};
  User: { // root type
    email: string; // String!
    id: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  AuthPayload: { // field return type
    token: string | null; // String
    user: NexusGenRootTypes['User'] | null; // User
  }
  List: { // field return type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    current: NexusGenRootTypes['ListRevision'] | null; // ListRevision
    id: string; // String!
    name: string; // String!
    owner: NexusGenRootTypes['User'] | null; // User
    ownerId: string; // String!
    revisions: NexusGenRootTypes['ListRevision'][]; // [ListRevision!]!
    status: NexusGenEnums['ListStatus']; // ListStatus!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  }
  ListMember: { // field return type
    gender: NexusGenEnums['Gender']; // Gender!
    id: string; // String!
    listRevId: string; // String!
    position: number; // Int!
  }
  ListRevision: { // field return type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    id: string; // String!
    members: NexusGenRootTypes['ListMember'][]; // [ListMember!]!
    ownerId: string; // String!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  }
  Mutation: { // field return type
    createList: NexusGenRootTypes['List'] | null; // List
    login: NexusGenRootTypes['AuthPayload'] | null; // AuthPayload
    signup: NexusGenRootTypes['AuthPayload'] | null; // AuthPayload
  }
  Query: { // field return type
    allUsers: NexusGenRootTypes['User'][]; // [User!]!
    listById: NexusGenRootTypes['List'] | null; // List
    me: NexusGenRootTypes['User'] | null; // User
  }
  User: { // field return type
    email: string; // String!
    id: string; // String!
    lists: NexusGenRootTypes['List'][]; // [List!]!
  }
}

export interface NexusGenFieldTypeNames {
  AuthPayload: { // field return type name
    token: 'String'
    user: 'User'
  }
  List: { // field return type name
    createdAt: 'DateTime'
    current: 'ListRevision'
    id: 'String'
    name: 'String'
    owner: 'User'
    ownerId: 'String'
    revisions: 'ListRevision'
    status: 'ListStatus'
    updatedAt: 'DateTime'
  }
  ListMember: { // field return type name
    gender: 'Gender'
    id: 'String'
    listRevId: 'String'
    position: 'Int'
  }
  ListRevision: { // field return type name
    createdAt: 'DateTime'
    id: 'String'
    members: 'ListMember'
    ownerId: 'String'
    updatedAt: 'DateTime'
  }
  Mutation: { // field return type name
    createList: 'List'
    login: 'AuthPayload'
    signup: 'AuthPayload'
  }
  Query: { // field return type name
    allUsers: 'User'
    listById: 'List'
    me: 'User'
  }
  User: { // field return type name
    email: 'String'
    id: 'String'
    lists: 'List'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createList: { // args
      data: NexusGenInputs['ListCreateInput']; // ListCreateInput!
    }
    login: { // args
      email: string; // String!
      password: string; // String!
    }
    signup: { // args
      email: string; // String!
      password: string; // String!
    }
  }
  Query: {
    listById: { // args
      id?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}