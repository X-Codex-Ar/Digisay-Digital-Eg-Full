# Changelog

## [1.1.0](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/compare/v1.0.0...v1.1.0) (2026-11-25)


### Features

* **platform:** add AI triage and automated releases ([#28](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/issues/28)) ([1301244](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/13012441604e05ec91caee7dbf6c0e9aae1b82d3))
* **privacy:** add analytics consent controls ([50f40a4](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/50f40a4c2e7f6b4b38593d3ab50e8aa29105830f))
* **privacy:** add explicit analytics consent storage ([b76a5d1](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/b76a5d10aee838a35de263fd0cfe9eab21d12400))
* **privacy:** expose global analytics preferences ([f6fc0fb](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/f6fc0fbe65838ab4ac90080b162232e57928e8db))
* **storage:** 20261125210540_StorageObjectMetadata.cs ([7bfc10c](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/7bfc10c2e2183a5eea61887ce434f8e8d9277038))
* **storage:** 20261125210540_StorageObjectMetadata.Designer.cs ([cf57c39](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/cf57c3908bfecb3ec2a2af04f20431d02bfef3f8))
* **storage:** ContentStorageUseCaseTests.cs ([792fa83](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/792fa838162bb552309a20cad844ece52ebba70f))
* **storage:** CreateDownloadLinkHandler.cs ([4e49d92](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/4e49d92995fea98e61b1eb60693138349914699b))
* **storage:** DeleteObjectHandler.cs ([a6b9875](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/a6b98758f85af24e13d9bcdd10bccaaf5a0bb910))
* **storage:** DependencyInjection.cs ([da2c3c9](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/da2c3c96d2e430751c083a5265ef68269501cdb6))
* **storage:** DependencyInjection.cs ([1d01892](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/1d01892740cfebba65e884237737f829895db139))
* **storage:** DigiSayDbContext.cs ([918a689](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/918a6898b9c1e75093db4668b561abb059332ec5))
* **storage:** DigiSayDbContextModelSnapshot.cs ([424bc2f](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/424bc2f8535a587898b0cd04abb738b833c22ffc))
* **storage:** GetObjectHandler.cs ([6a96940](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/6a96940c46816a231587ba670922396e6bf1ca0b))
* **storage:** IStorageObjectStore.cs ([38aff6f](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/38aff6f31291dae2a8cdb19c2ae431fd22d6060e))
* **storage:** persist private object metadata and align REST contract ([6d9fc56](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/6d9fc566e89321ef2d1dc34a1ad76077275f3b65))
* **storage:** PrivateStorageApiTests.cs ([4d51edd](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/4d51eddd109503b69dafca334309c920b8ecc0ce))
* **storage:** StorageEndpoints.cs ([827412b](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/827412b307e44bd357bdd19950f5acc58e88d6f0))
* **storage:** StorageObjectNotFoundException.cs ([d053d17](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/d053d1785bd08a18c10fa86a5d3bae6b67e534ac))
* **storage:** StorageObjectRecord.cs ([4b3b109](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/4b3b109008f0966f4576096512581170067ced7d))
* **storage:** StorageObjectRecordConfiguration.cs ([883f605](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/883f60578b28af08d42e170045714f4fa86c662a))
* **storage:** StorageObjectStore.cs ([fe7051d](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/fe7051dff783b26d98466c834e9d2b3a589c5a0e))
* **storage:** SupabaseStorageAdapter.cs ([33ac9d0](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/33ac9d099432ee533068c1241ca3d7c4f8d7ba01))
* **storage:** SupabaseStorageAdapterTests.cs ([0c48675](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/0c486758e7d3e6e0ea644ad52609dea9729710ba))
* **storage:** UploadObjectCommand.cs ([b80892b](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/b80892b294951bbbd7385d819617276a51ab3e39))
* **storage:** UploadObjectHandler.cs ([2637169](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/26371699c3ad1ef64cbec6fb7f5bc893bb97341c))


### Bug Fixes

* **api:** make organization creation Location resolvable ([15419a0](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/15419a060be2cb67a34a8b02f953d142d7e56af3))
* **api:** return Location for created organizations and add GET by id ([fe75c45](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/fe75c4564dec4dcf9bda991ab9fdfba833c3282c))
* **privacy:** avoid consent control flash before preference load ([67155a3](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/67155a31c69c97741c2a025ca4886259901bf577))
* **privacy:** gate page views behind explicit consent ([ffb347b](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/ffb347be4e5279369f6435c7ea891797a354f4b2))
* **privacy:** make concurrent consent updates deterministic ([d0bc1ec](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/d0bc1ec312afc1e19132c66d1a90a4cdf227fde2))
* **privacy:** make consent changes race-safe ([65d55e1](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/65d55e1c1487431732ae3ab8da420bf0a0156da9))
* **privacy:** recheck consent across analytics initialization ([59b57e7](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/59b57e743cbb99d3ed2aa9f85c22ec716e09c60a))
* **privacy:** require analytics consent before tracking ([2f8e0a1](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/2f8e0a1a453f312cf363a07273b07fe321584322))
* **storage:** restore DigiSayDbContext.cs formatting ([2837fce](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/2837fce0b00f495b7e303598c085fa7577ff9289))
* **web:** satisfy public react formatting ([844a5e9](https://github.com/X-Codex-Ar/Digisay-Digital-Eg-Full/commit/844a5e9755678c3977955c7ffe17c82ecfdc4690))
