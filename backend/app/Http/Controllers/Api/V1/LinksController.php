<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Link\ReorderLinksRequest;
use App\Http\Requests\Link\StoreLinkRequest;
use App\Http\Requests\Link\UpdateLinkRequest;
use App\Http\Resources\LinkResource;
use App\Models\Link;
use App\Services\LinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LinksController extends Controller
{
    public function __construct(private readonly LinkService $linkService) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->linkService->listForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => LinkResource::collection($paginator->items()),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(StoreLinkRequest $request): JsonResponse
    {
        $link = $this->linkService->create($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'data'    => new LinkResource($link),
        ], 201);
    }

    public function update(UpdateLinkRequest $request, Link $link): JsonResponse
    {
        $this->authorize('update', $link);

        $link = $this->linkService->update($link, $request->validated());

        return response()->json([
            'success' => true,
            'data'    => new LinkResource($link),
        ]);
    }

    public function toggle(Link $link): JsonResponse
    {
        $this->authorize('update', $link);

        $link = $this->linkService->toggleActive($link);

        return response()->json([
            'success' => true,
            'data'    => new LinkResource($link),
        ]);
    }

    public function destroy(Link $link): JsonResponse
    {
        $this->authorize('delete', $link);

        $this->linkService->delete($link);

        return response()->json(['success' => true], 200);
    }

    public function reorder(ReorderLinksRequest $request): JsonResponse
    {
        $this->linkService->reorder($request->user(), $request->validated('ids'));

        return response()->json(['success' => true]);
    }
}
