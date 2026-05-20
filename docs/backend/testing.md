# Estratégia de Testes — Backend

## Pirâmide de Testes

```
         /\
        /E2E\         ~10% — Fluxos críticos completos
       /------\
      /Integra-\      ~20% — Endpoints e banco real
     /----------\
    /  Unitários  \   ~70% — Lógica de negócio isolada
   /--------------\
```

**Regra:** O custo de manutenção aumenta com a subida da pirâmide. Invista mais em testes unitários rápidos e confiáveis.

---

## Convenção de Nomenclatura

```
should [comportamento esperado] when [condição]
```

Exemplos:
- `should return user when valid id provided`
- `should throw UserNotFoundException when user does not exist`
- `should send confirmation email when order is created`
- `should not allow purchase when user is suspended`

---

## Unitários — Services e Domain

### Padrão: Arrange / Act / Assert (AAA)

**Laravel (PHPUnit)**

```php
<?php

namespace Tests\Unit\Services;

use App\Exceptions\Domain\UserNotFoundException;
use App\Services\UserService;
use App\Repositories\UserRepository;
use Mockery;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    private UserService $service;
    private UserRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = Mockery::mock(UserRepository::class);
        $this->service = new UserService($this->repository);
    }

    public function test_should_return_user_when_valid_id_provided(): void
    {
        // Arrange
        $user = User::factory()->make(['id' => 1, 'name' => 'John Doe']);
        $this->repository->expects('findById')->with(1)->andReturn($user);

        // Act
        $result = $this->service->findById(1);

        // Assert
        $this->assertEquals('John Doe', $result->name);
    }

    public function test_should_throw_exception_when_user_does_not_exist(): void
    {
        // Arrange
        $this->repository->expects('findById')->with(999)->andReturn(null);

        // Act & Assert
        $this->expectException(UserNotFoundException::class);
        $this->service->findById(999);
    }
}
```

**NestJS (Jest)**

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('findById', () => {
    it('should return user when valid id provided', async () => {
      // Arrange
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      repository.findById.mockResolvedValue(user);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toEqual(user);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Integração — Controllers e Endpoints

### Princípio: Banco Real, Sem Mocks de HTTP

Testes de integração devem usar banco de dados real (SQLite in-memory em dev, mesmo driver em CI).

**Laravel — Feature Tests**

```php
<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_should_return_user_list_when_authenticated(): void
    {
        // Arrange
        $user = User::factory()->create();
        User::factory(5)->create();
        Sanctum::actingAs($user);

        // Act
        $response = $this->getJson('/api/v1/users');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [['id', 'name', 'email']],
                'meta' => ['total', 'per_page', 'current_page'],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_should_return_401_when_not_authenticated(): void
    {
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(401);
    }

    public function test_should_create_user_when_valid_data_provided(): void
    {
        // Arrange
        Sanctum::actingAs(User::factory()->admin()->create());
        $payload = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'Secret@123',
            'password_confirmation' => 'Secret@123',
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $payload);

        // Assert
        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'jane@example.com');

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    }

    public function test_should_return_422_when_email_already_exists(): void
    {
        // Arrange
        User::factory()->create(['email' => 'existing@example.com']);
        Sanctum::actingAs(User::factory()->admin()->create());

        // Act
        $response = $this->postJson('/api/v1/users', [
            'name' => 'Another User',
            'email' => 'existing@example.com',
            'password' => 'Secret@123',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['error' => ['details' => ['email']]]);
    }
}
```

**NestJS — Supertest**

```typescript
describe('UserController (integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(UserEntity));
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/users', () => {
    it('should return 200 with user list when authenticated', async () => {
      // Arrange
      const token = await getAuthToken(app);
      await userRepository.save([
        { name: 'User A', email: 'a@example.com', passwordHash: 'hash' },
        { name: 'User B', email: 'b@example.com', passwordHash: 'hash' },
      ]);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(2);
        });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/api/v1/users').expect(401);
    });
  });
});
```

---

## Factories — Dados Realistas

**Nunca use dados hardcoded.** Use factories para gerar dados realistas e variados.

```php
// Laravel Factory
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => bcrypt('Secret@123'),
            'status' => 'active',
            'email_verified_at' => now(),
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }

    public function suspended(): static
    {
        return $this->state(['status' => 'suspended']);
    }
}
```

---

## Cobertura Mínima

| Camada | Cobertura Mínima |
|--------|-----------------|
| Services | 90% |
| Controllers | 80% |
| Repositories | 70% |
| Geral | 70% |

---

## Regras PROIBIDAS

```
❌ Usar dados hardcoded em vez de factories
❌ Compartilhar estado entre testes (sempre limpar banco)
❌ Testar implementação em vez de comportamento
❌ Mockar o banco de dados em testes de integração
❌ Testes que dependem de ordem de execução
❌ Sleep/wait arbitrários em testes
```
