<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email'    => 'gabriel@example.com',
            'password' => 'secret123',
        ]);
    }

    public function test_logs_in_successfully_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'gabriel@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'user'  => ['id', 'name', 'username', 'email', 'created_at'],
                    'token',
                ],
            ]);
    }

    public function test_returns_401_with_wrong_password(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'gabriel@example.com',
            'password' => 'wrong_password',
        ])->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Credenciais inválidas.');
    }

    public function test_returns_401_with_non_existing_email(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'naoexiste@example.com',
            'password' => 'secret123',
        ])->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_returns_422_when_fields_are_missing(): void
    {
        $this->postJson('/api/v1/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_returns_422_when_email_is_invalid(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'not-an-email',
            'password' => 'secret123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_token_is_returned_on_successful_login(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'gabriel@example.com',
            'password' => 'secret123',
        ]);

        $this->assertNotEmpty($response->json('data.token'));
    }
}
