<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name'                  => 'Gabriel Müller',
            'username'              => 'gabriel',
            'email'                 => 'gabriel@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
        ], $overrides);
    }

    public function test_registers_user_successfully(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'user'  => ['id', 'name', 'username', 'email', 'created_at'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'gabriel',
            'email'    => 'gabriel@example.com',
        ]);
    }

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        $this->postJson('/api/v1/auth/register', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'username', 'email', 'password']);
    }

    public function test_returns_422_when_email_is_already_taken(): void
    {
        User::factory()->create(['email' => 'gabriel@example.com']);

        $this->postJson('/api/v1/auth/register', $this->validPayload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_returns_422_when_username_is_already_taken(): void
    {
        User::factory()->create(['username' => 'gabriel']);

        $this->postJson('/api/v1/auth/register', $this->validPayload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_returns_422_when_password_confirmation_does_not_match(): void
    {
        $this->postJson('/api/v1/auth/register', $this->validPayload([
            'password_confirmation' => 'wrong_password',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_returns_422_when_username_contains_invalid_characters(): void
    {
        $this->postJson('/api/v1/auth/register', $this->validPayload([
            'username' => 'Gabriel Müller',
        ]))->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_password_is_hashed_before_saving(): void
    {
        $this->postJson('/api/v1/auth/register', $this->validPayload());

        $user = User::where('email', 'gabriel@example.com')->first();
        $this->assertNotEquals('secret123', $user->password);
    }

    public function test_token_is_returned_on_successful_registration(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validPayload());

        $token = $response->json('data.token');
        $this->assertNotEmpty($token);
    }
}
